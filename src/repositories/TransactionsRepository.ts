import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const finalBalance: Balance = transactions.reduce(
      (balance: Balance, transaction: Transaction) => {
        // https://stackoverflow.com/questions/54274004/why-am-i-getting-a-assignment-to-property-of-function-parameter-eslinterror
        const bal = balance;

        if (transaction.type === 'income') {
          bal.income += Number(transaction.value);
          bal.total += Number(transaction.value);
        } else if (transaction.type === 'outcome') {
          bal.outcome += Number(transaction.value);
          bal.total -= Number(transaction.value);
        }

        return bal;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return finalBalance;
  }
}

export default TransactionsRepository;
