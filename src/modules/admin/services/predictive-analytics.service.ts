import { PrismaService } from '@modules/prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ProductEntity } from '@prisma/client';
import * as ss from 'simple-statistics';

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

  async getInventoryPrediction(): Promise<number[]> {
    // Logic to fetch historical inventory data from Prisma
    const historicalInventory: Partial<ProductEntity>[] =
      await this.prisma.productEntity.findMany({
        select: {
          quantity: true,
        },
      });

    // Example: Calculate average inventory quantity for each product
    const inventoryQuantities = historicalInventory.map(
      (product) => product.quantity,
    );
    const averageInventory =
      inventoryQuantities.reduce((acc, val) => acc + val, 0) /
      inventoryQuantities.length;

    // Example: Generate prediction (dummy data)
    const prediction = Array.from(
      { length: 30 },
      (_, i) => averageInventory + i,
    );

    return prediction;
  }
}
