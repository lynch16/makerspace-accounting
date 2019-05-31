interface Transaction {
  active: boolean;
  anchor_line_item: LineItem;
  business_id: string;
  credit_total: TransactionTotal;
  date: string;
  date_created: string;
  debit_total: TransactionTotal;
  description: string;
  direction: Withdrawl | Deposit;
  guid: string;
  line_items: LineItem[];
  notes: string;
  sequence: number;
  transaction_currency: Currency;
  transaction_status: Verified | NotVerified;
  transaction_total: TransactionTotal;
  user_date_modified: string;
}

interface LineItem {
  account_currency: Currency;
  account_guid: string;
  account_name: string;
  amount: {
    account: Currency;
    business: Currency;
    transaction: Currency;
  };
  categorization_type: Categorization;
  guid: string;
  item_type: Credit | Debit;
}

type Credit = {
  value: 1,
  display_name: "Credit"
};
type Debit = {
  value: 0,
  display_name: "Debit"
};
type Deposit = {
  value: 0,
  display_name: "Deposit"
};
type Withdrawl = {
  value: 1,
  display_name: "Withdrawal"
};
type Verified = {
  value: 1,
  display_name: "Verified"
};
type NotVerified = {
  value: 0,
  display_name: "Not Verified"
};
enum Categorization {
  Expense = "Expense",
  Income = "Income",
  Other = "Other",
}

interface Currency {
  code: string;
  name: string;
  plural: string;
  symbol: string;
}

interface TransactionTotal {
  account: string;
  business: string;
  transaction: {
    currency: Currency;
    formatted_string: string;
    value: string;
  };
}
