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
const dump = "./dump/store.json"
const fileName = "./dump/detail.json"
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}


const { URL } = require('url');

const basePath = "https://api.waveapps.com/businesses";
const businessId = "4d3f0d69-6e5b-4ab6-a576-49da82d7c8b3";
const path = "transactions" // transactions/latest for list
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
    default: true,
    required: true
  }
};

const listParams = Object.values(listParamOptions).reduce((params, val) => {
  if (val.required) {
    params[val.key] = val.default;
  }
  return params;
}, {});


const buildUrl = (id) => {
  const url = new URL(`${basePath}/${businessId}/${path}/${id}`);
  return url;
}
const data = [];
const fetchTransactions = (url) => {
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(async (res) => {
    const d = await res.json();
    data.push(JSON.stringify(d, null, 2));
  }).catch(e => console.log(e));
}


const json = fs.readFileSync(dump)
const ids = JSON.parse(json).map(t => t.transaction_guid);
Promise.all(ids.map(id => {
  return new Promise(resolve => {
    setTimeout(async () => {
      await fetchTransactions(buildUrl(id));
      resolve();
    }, 1000);
  });
})).then(() => {
  console.log("WRITING SIZE", data.length);
  fs.writeFileSync(fileName, "[" + data.join("," + os.EOL) + "]");
});

