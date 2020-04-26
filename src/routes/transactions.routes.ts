import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import Category from '../models/Category';

// import ImportTransactionsService from '../services/ImportTransactionsService';
interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionResponse {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: Category;
  created_at: Date;
  updated_at: Date;
}

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions: Transaction[] = await transactionRepository.find();

  const balance: Balance = await transactionRepository.getBalance();

  const t = transactions.map(
    ({
      id,
      title,
      value,
      type,
      category,
      created_at,
      updated_at,
    }: TransactionResponse) => {
      return {
        id,
        title,
        value,
        type,
        category,
        created_at,
        updated_at,
      };
    },
  );

  return response.json({ transactions: t, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category_id } = request.body;

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category_id,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  deleteTransaction.execute(id);

  return response.status(200).send();
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
