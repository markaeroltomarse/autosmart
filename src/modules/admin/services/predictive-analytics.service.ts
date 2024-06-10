import { ITransactionProductsJson } from '../../../data/types/transaction.types';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionEntity } from '@prisma/client';
import * as ss from 'simple-statistics';
import { ISummaryOutputDto } from '../dto/output/dashboard';

@Injectable()
export class PredictiveAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesPrediction() {
    // Fetch all transaction records from the database
    const transactions = await this.prisma.transactionEntity.findMany();

    // Extract the totalAmount from each transaction
    const salesData = transactions.map((t) => t.totalAmount);

    // Check if there is enough data for prediction
    if (salesData.length < 2) {
      throw new Error('Not enough data for prediction');
    }

    // Prepare the data for linear regression
    const regressionData = salesData.map((totalAmount, index) => [
      index,
      totalAmount,
    ]);

    // Perform linear regression to find the best fit line
    const regressionLine = ss.linearRegression(regressionData);

    // Extract the coefficients
    const { m: slope, b: intercept } = regressionLine;

    // Predict the totalAmount for the next index
    const nextIndex = salesData.length;
    const prediction = slope * nextIndex + intercept;

    return { prediction, regressionData, slope, intercept };
  }

  async getInventoryPrediction() {
    // Fetch historical transaction data
    const transactions: TransactionEntity[] =
      await this.prisma.transactionEntity.findMany();

    // Aggregate sales data by date
    const salesByDate: { [date: string]: number } = {};
    transactions.forEach((transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      transaction.products.forEach((product) => {
        const transactionProduct =
          product as unknown as ITransactionProductsJson;
        if (!salesByDate[date]) {
          salesByDate[date] = 0;
        }
        salesByDate[date] += transactionProduct.quantity;
      });
    });

    // Generate future inventory predictions (simple linear regression for example)
    const quantities = Object.values(salesByDate);

    // Dummy prediction: Next 30 days with some simple logic (replace with actual predictive model)
    const futurePredictions = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      quantity: quantities.reduce((a, b) => a + b, 0) / quantities.length, // Average sales as prediction
    }));

    return futurePredictions;
  }

  async getSummary(): Promise<ISummaryOutputDto> {
    const totalCustomers = await this.prisma.customerEntity.count();
    const totalRiders = await this.prisma.customerEntity.count({
      where: { isRider: true },
    });
    const totalProducts = await this.prisma.productEntity.count();
    const totalTransactions = await this.prisma.transactionEntity.count();
    const totalRevenue = await this.prisma.transactionEntity.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const pendingTransactions = await this.prisma.transactionEntity.count({
      where: {
        status: 'pending',
      },
    });

    return {
      totalCustomers,
      totalProducts,
      totalTransactions,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingTransactions,
      totalRiders,
    };
  }
}
