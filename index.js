const fetch = require("node-fetch");
const fs = require('fs');
const os = require('os');
const argv = require('yargs').argv;

const token = argv.token;

if (!token) {
  console.error("No token found");
  process.exit(-1);
}

const dir = "./dump";
const fileName = "./dump/store.json"
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}


const { URLSearchParams, URL } = require('url');

const basePath = "https://api.waveapps.com/businesses";
const businessId = "4d3f0d69-6e5b-4ab6-a576-49da82d7c8b3";
const path = "transactions/latest"
const categories = {
  expenses: "594522407558008182",
}
const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const baseMonth = date.getMonth() + 1;
  const baseDay = date.getDate();
  const month = baseMonth < 10 ? `0${baseMonth}` : baseMonth;
  const day = baseDay < 10 ? `0${baseDay}` : baseDay;
  return `${year}-${month}-${day}`;
}
const listParamOptions = {
  category: {
    key: "category_guids",
    default: categories.expenses,
    required: false,
  },
  startDate: {
    key: "start_date",
    default: "2016-01-01",
    required: true,
  },
  endDate: {
    key: "end_date",
    default: formatDate(),
    required: true
  },
  pageSize: {
    key: "page_size",
    default: 200,
    required: true,
  },
  showHidden: {
    key: "show_hidden_transactions",
    default: true,
    required: true
  },
  sort: {
    key: "sort_order",
    default: "DESC",
    required: true,
  },
  fullTransaction: {
    key: "include_full_transaction",
    default: false,
    required: true
  }
};

const listParams = Object.values(listParamOptions).reduce((params, val) => {
  if (val.required) {
    params[val.key] = val.default;
  }
  return params;
}, {});


const buildUrl = (queryParams) => {
  const queryString = new URLSearchParams(queryParams);
  const url = new URL(`${basePath}/${businessId}/${path}`);
  url.search = queryString;
  return url;
}

let beginning = new Date();
const startDate = new Date("2016-01-01");
const data = [];

// TODO: why cant we just use end date for tracking
// It seems like there is some inconcsistencies to how their API returns data.
// I get data spanning years from one call
const fetchTransactions = (url) => {
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(async (res) => {
    const { latest_transactions: transactions } = await res.json();
    data.push(...(transactions.map(t => JSON.stringify(t, null, 2))));

    const lastDate = transactions.reduce((latest, transaction) => {
      const tDate = new Date(transaction.transaction_date);
      if (tDate < latest) { // Set as latest date if transaction is after current tracker
        latest = tDate;
      }
      return latest;
    }, beginning);


    if (lastDate > startDate && lastDate < beginning) {
      beginning = lastDate
      const updatedQueryParams = {
        ...listParams,
        next_page_date: formatDate(lastDate)
      };
      return new Promise((resolve) => {
        setTimeout(async () => {
          await fetchTransactions(buildUrl(updatedQueryParams));
          resolve();
        }, 1000)
      });
    }
  }).catch(e => console.log(e));
}



fetchTransactions(buildUrl(listParams)).then(() => {
  console.log("WRITING SIZE", data.length);
  fs.writeFileSync(fileName, "[" + data.join("," + os.EOL) + "]");
});

