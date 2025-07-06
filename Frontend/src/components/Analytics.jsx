import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CHART_COLORS = {
  Food: 'rgb(255, 159, 64)',
  Transport: 'rgb(54, 162, 235)',
  Shopping: 'rgb(255, 99, 132)',
  Bills: 'rgb(75, 192, 192)',
  Entertainment: 'rgb(153, 102, 255)',
  Health: 'rgb(255, 206, 86)',
  Education: 'rgb(111, 205, 205)',
  Other: 'rgb(201, 203, 207)',
  Salary: 'rgb(46, 204, 113)',
  Freelance: 'rgb(52, 152, 219)',
  Investments: 'rgb(155, 89, 182)',
  'Other Income': 'rgb(241, 196, 15)'
};

const Analytics = ({ transactions }) => {
  const [timeframe, setTimeframe] = useState('month');
  const [chartType, setChartType] = useState('category');
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (!transactions.length) return;

    // Process category-wise data
    const categoryTotals = {};
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += amount;
    });

    const categoryChartData = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(cat => CHART_COLORS[cat]),
        borderWidth: 1
      }]
    };
    setCategoryData(categoryChartData);

    // Process monthly data
    const monthlyTotals = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = { income: 0, expense: 0 };
      }
      if (transaction.amount > 0) {
        monthlyTotals[monthYear].income += transaction.amount;
      } else {
        monthlyTotals[monthYear].expense += Math.abs(transaction.amount);
      }
    });

    const monthlyChartData = {
      labels: Object.keys(monthlyTotals),
      datasets: [
        {
          label: 'Income',
          data: Object.values(monthlyTotals).map(m => m.income),
          backgroundColor: 'rgba(46, 204, 113, 0.5)',
          borderColor: 'rgb(46, 204, 113)',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: Object.values(monthlyTotals).map(m => m.expense),
          backgroundColor: 'rgba(231, 76, 60, 0.5)',
          borderColor: 'rgb(231, 76, 60)',
          borderWidth: 1
        }
      ]
    };
    setMonthlyData(monthlyChartData);
  }, [transactions]);

  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16
        }
      }
    }
  });

  const calculateSummary = () => {
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      categoryTotals: {},
      mostSpentCategory: { name: '', amount: 0 }
    };

    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      if (transaction.amount > 0) {
        summary.totalIncome += amount;
      } else {
        summary.totalExpense += amount;
        if (!summary.categoryTotals[transaction.category]) {
          summary.categoryTotals[transaction.category] = 0;
        }
        summary.categoryTotals[transaction.category] += amount;
      }
    });

    Object.entries(summary.categoryTotals).forEach(([category, amount]) => {
      if (amount > summary.mostSpentCategory.amount) {
        summary.mostSpentCategory = { name: category, amount };
      }
    });

    return summary;
  };

  const summary = calculateSummary();

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h3>Expense Analytics</h3>
        <div className="analytics-filters">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="category-select"
          >
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="category-select"
          >
            <option value="category">Category Breakdown</option>
            <option value="monthly">Monthly Trend</option>
          </select>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Income</h4>
          <p className="summary-amount income">₹{summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Total Expenses</h4>
          <p className="summary-amount expense">₹{summary.totalExpense.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Most Spent On</h4>
          <p className="summary-category">{summary.mostSpentCategory.name}</p>
          <p className="summary-amount">₹{summary.mostSpentCategory.amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="chart-container">
        {chartType === 'category' ? (
          <Doughnut
            data={categoryData}
            options={getChartOptions('Expense by Category')}
          />
        ) : (
          <Bar
            data={monthlyData}
            options={getChartOptions('Monthly Income vs Expenses')}
          />
        )}
      </div>
    </div>
  );
};

Analytics.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Analytics; 