// // schemas.js


// export const UserSchema = {
//   name: 'User',
//   primaryKey: '_id',
//   properties: {
//     _id: 'int',
//     username: 'string',
//     password: 'string', // Note: Storing plain passwords is not recommended for production apps
//   },
// };

import Realm from 'realm';
import { BSON } from 'realm';
// export class User extends Realm.Object<User> {
//   _id!: Realm.BSON.ObjectId;
//   username!: string;
//   password!: string;
//   token?: string;
//   income!: number;
//   expensesCategories!: Realm.List<ExpenseCategory>;

//   static primaryKey: '_id';
// };

// export class ExpenseCategory extends Realm.Object<ExpenseCategory> {
//   //_id: Realm.BSON.ObjectId;
//   name!: string;
//   expenses!: number;
//   isSelected!: boolean;

//   static embedded?: true;
//   static primaryKey: '_id';
// };

export class User extends Realm.Object {
  _id: BSON.ObjectId = new BSON.ObjectId();
  email!: string;
  firstName!: string;
  lastName!: string;
  password!: string;
  token?: string;
  incomeCategories!: Realm.List<IncomeCategory>;
  expensesCategories!: Realm.List<ExpenseCategory>;
  transactions!: Realm.List<Transaction>; // Embedded Transaction list
  // ... other properties
}

export class Transaction extends Realm.Object {
  id: BSON.ObjectId = new BSON.ObjectId();
  amount!: number;
  date!: Date;
  category!: string; // This would be the name of the ExpenseCategory or IncomeCategory
  description?: string;
  type!: string; // Type of transaction
}

export class IncomeEntry extends Realm.Object {
  id: BSON.ObjectId = new BSON.ObjectId();
  amount!: number;
  date!: Date;
  category!: string; // This would be the name of the IncomeCategory
  description?: string;
  // ... possibly other properties like description, source, etc.
}

export class IncomeCategory extends Realm.Object {
  name!: string;
  income!: Realm.List<IncomeEntry>; // Changed to list of IncomeEntry
  isSelected!: boolean;
}

export class ExpenseEntry extends Realm.Object {
  id: BSON.ObjectId = new BSON.ObjectId();
  amount!: number;
  date!: Date;
  category!: string; // This would be the name of the ExpenseCategory
  description?: string;
  // ... possibly other properties like description, etc.
}

export class ExpenseCategory extends Realm.Object {
  name!: string;
  expenses!: Realm.List<ExpenseEntry>; // Changed to list of ExpenseEntry
  isSelected!: boolean;
}

export const UserSchema: Realm.ObjectSchema = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    email: 'string',
    firstName: 'string',
    lastName: 'string',
    password: 'string',
    token: 'string?',
    incomeCategories: { type: 'list', objectType: 'IncomeCategory' },
    expensesCategories: { type: 'list', objectType: 'ExpenseCategory' },
    transactions: { type: 'list', objectType: 'Transaction' },  // Embedded Transaction list
  },
};

export const IncomeEntrySchema: Realm.ObjectSchema = {
  name: 'IncomeEntry',
  embedded: true,
  properties: {
    id: 'objectId',
    amount: 'double',
    date: 'date',
    category: 'string',
    description: 'string?',
  },
};

export const IncomeCategorySchema: Realm.ObjectSchema = {
  name: 'IncomeCategory',
  embedded: true,
  properties: {
    name: 'string',
    income: { type: 'list', objectType: 'IncomeEntry' },
    isSelected: 'bool',
  },
};

export const ExpenseEntrySchema: Realm.ObjectSchema = {
  name: 'ExpenseEntry',
  embedded: true,
  properties: {
    id: 'objectId',
    amount: 'double',
    date: 'date',
    category: 'string',
    description: 'string?',
  },
};

export const ExpenseCategorySchema: Realm.ObjectSchema = {
  name: 'ExpenseCategory',
  embedded: true,
  properties: {
    name: 'string',
    expenses: { type: 'list', objectType: 'ExpenseEntry' },
    isSelected: 'bool',
  },
};

export const IncomeCategories =[
  { name: 'Deposits', isSelected: true },
  { name: 'Salary',   isSelected: true },
  { name: 'Savings',  isSelected: true },
];

export const TransactionSchema: Realm.ObjectSchema = {
  name: 'Transaction',
  embedded: true,  // This marks the schema as embedded
  properties: {
    id: 'objectId',
    amount: 'double',
    date: 'date',
    category: 'string',
    description: 'string?',
    type: 'string',
  },
};

export const defaultCategories = [
  { name: 'Health', isSelected: false },
  { name: 'Personal Care', isSelected: false },
  { name: 'Education', isSelected: false },
  { name: 'Bills', isSelected: false },
  { name: 'House', isSelected: false },
  { name: 'Utilities', isSelected: false },
  { name: 'Clothes', isSelected: false },
  { name: 'Transport', isSelected: false },
  { name: 'Groceries', isSelected: false },
  { name: 'Rent', isSelected: false },
  { name: 'Travel', isSelected: false },
  { name: 'Electronics', isSelected: false },
  { name: 'Sports', isSelected: false },
  { name: 'Gifts', isSelected: false },
  { name: 'Car', isSelected: false },
  { name: 'Shopping', isSelected: false },
  { name: 'Eating Out', isSelected: false },
  { name: 'Entertainment', isSelected: false },
  { name: 'Pets', isSelected: false },
  { name: 'Beauty', isSelected: false },
];
  // add shopping, rent, utilities, insurance, phone, substriction, travel, other, toiletries, beauty, electronics, taxes, charity, hobbies


// export const ExpenseCategorySchema = {
//   name: 'ExpenseCategory',
//   primaryKey: '_id',
//   properties: {
//     _id: 'objectId',
//     name: 'string',
//     expenses: 'double',
//     isSelected: 'bool',
//   },
// };


// export const UserSchema = {
//   name: 'User',
//   primaryKey: '_id',
//   properties: {
//     _id: 'objectId',
//     username: 'string',
//     password: 'string', // Consider hashing this for security
//     token: 'string?', // Optional, can be null
//     income: 'double',
//     expensesCategories: 'ExpenseCategory[]', // List of ExpenseCategory
//   },
// };