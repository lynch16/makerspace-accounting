const fs = require("fs");
const { EOL } = require("os");
const transactions = require("./dump/detail.json");

const getFiscalYear = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(s => Number(s));
  return month <= 12 && month >= 9 ? year + 1 : year;
}
const toCsvRow = (list) => {
  return `${list.map(item => "\"" + item + "\"").join(",")}${EOL}`;
}

const headers = {
  id: "ID",
  date: "Date",
  fiscalYear: "Fiscal Year",
  account: "Account",
  description: "Description",
  notes: "Notes",
  type: "Debit or Credit",
  category: "Category",
  currency: "Currency",
  value: "Value",
  status: "Transaction Status"
};

const mapObjectToHeaderColumns = (dataObj) => {
  return Object.keys(headers).reduce((normalizedObject, key) => {
    normalizedObject[key] = dataObj[key];
    return normalizedObject;
  }, {});
}

const init = () => {
  const csv = fs.createWriteStream("./csv/transactions.csv", { flags: "w" });
  csv.write(toCsvRow(Object.values(headers)));

  transactions.forEach(({ transaction }) => {
    if (!transaction) { return null; }
    const { guid, date, description, notes, transaction_status: status, line_items: items } = transaction;

    let transactionData = {
      date,
      description,
      notes,
      fiscalYear: getFiscalYear(date),
      id: guid,
      ...(status && {
        status: status.display_name
      })
    };

    items && items.forEach(({ categorization_type: category, account_name: account, amount: { transaction: itemTransaction }, item_type: itemType }) => {

      transactionData = {
        ...transactionData,
        category,
        account,
        ...itemType && {
          type: itemType.display_name
        },
        ...itemTransaction && {
          value: itemTransaction.value,
          currency: itemTransaction.currency.symbol
        }
      }
      const mappedToHeader = mapObjectToHeaderColumns(transactionData);
      csv.write(toCsvRow(Object.values(mappedToHeader)));
    });
  });
  csv.end();
}

init();
