// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Balance is not enough for this transaction');
    }

    let categoryAlreadyExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryAlreadyExists) {
      categoryAlreadyExists = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryAlreadyExists);
    }

    // const transaction: Transaction;
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryAlreadyExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
