import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMoneyBillWave, FaSearch, FaFilter, FaArrowUp, FaArrowDown, 
  FaFileDownload, FaPlus, FaRegCalendarAlt, FaTags, FaRupeeSign,
  FaReceipt, FaCreditCard, FaCashRegister, FaRegClock,
  FaChevronRight, FaTimes, FaFileExport, FaCopy
} from 'react-icons/fa';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category?: 'credit' | 'debit' | 'subscription' | 'refund';
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'txn1', date: '2023-12-01', amount: 250.0, description: 'Payment received', category: 'credit' },
    { id: 'txn2', date: '2023-12-02', amount: -75.5, description: 'Refund issued', category: 'refund' },
    { id: 'txn3', date: '2023-12-03', amount: 120.0, description: 'Subscription charge', category: 'subscription' },
    { id: 'txn4', date: '2023-12-04', amount: -50.0, description: 'Utility bill payment', category: 'debit' },
    { id: 'txn5', date: '2023-12-05', amount: 1000.0, description: 'Salary credited', category: 'credit' },
    { id: 'txn6', date: '2023-12-06', amount: -200.0, description: 'Online shopping purchase', category: 'debit' },
    { id: 'txn7', date: '2023-12-07', amount: -30.0, description: 'Grocery debit', category: 'debit' },
    { id: 'txn8', date: '2023-12-08', amount: 150.0, description: 'Bonus payment', category: 'credit' },
    { id: 'txn9', date: '2023-12-09', amount: -15.0, description: 'Streaming service fee', category: 'subscription' },
    { id: 'txn10', date: '2023-12-10', amount: -25.0, description: 'Refund adjustment', category: 'refund' },
    { id: 'txn11', date: '2023-12-11', amount: 300.0, description: 'Freelance payment received', category: 'credit' },
    { id: 'txn12', date: '2023-12-12', amount: -100.0, description: 'Transfer sent', category: 'debit' },
    { id: 'txn13', date: '2023-12-13', amount: 20.0, description: 'Interest credited', category: 'credit' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'credit' | 'debit' | 'subscription' | 'refund'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportDateRange, setExportDateRange] = useState<'all' | 'current-month' | 'last-3-months' | 'last-6-months' | 'custom'>('all');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'completed'>('idle');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const depositTotal = transactions.filter(txn => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0);
  const withdrawalTotal = transactions.filter(txn => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0);
  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'deposit' && txn.amount > 0) ||
      (filterType === 'withdrawal' && txn.amount < 0);
    const matchesCategory = 
      filterCategory === 'all' ||
      txn.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category?: string) => {
    switch(category) {
      case 'credit':
        return <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <FaArrowUp size={10} /> Credit
        </span>;
      case 'debit':
        return <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <FaArrowDown size={10} /> Debit
        </span>;
      case 'subscription':
        return <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <FaRegClock size={10} /> Subscription
        </span>;
      case 'refund':
        return <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <FaCashRegister size={10} /> Refund
        </span>;
      default:
        return <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <FaReceipt size={10} /> Other
        </span>;
    }
  };

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleExportData = () => {
    setExportStatus('exporting');
    
    // Simulate export process
    setTimeout(() => {
      let dataToExport = sortedTransactions;
      
      // Apply date range filter
      if (exportDateRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        if (exportDateRange === 'current-month') {
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (exportDateRange === 'last-3-months') {
          cutoffDate.setMonth(now.getMonth() - 3);
        } else if (exportDateRange === 'last-6-months') {
          cutoffDate.setMonth(now.getMonth() - 6);
        }
        
        dataToExport = dataToExport.filter(txn => new Date(txn.date) >= cutoffDate);
      }

      if (exportFormat === 'csv') {
        // Create CSV
        const headers = ['Date', 'Description', 'Category', 'Amount'];
        const csvContent = [
          headers.join(','),
          ...dataToExport.map(txn => 
            `${txn.date},"${txn.description}",${txn.category || 'N/A'},${txn.amount}`
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (exportFormat === 'json') {
        // Create JSON
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (exportFormat === 'pdf') {
        // For PDF, we'll just show a message (actual PDF generation would need a library)
        console.log('PDF export would be generated here with a library like jsPDF');
      }
      
      setExportStatus('completed');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setExportStatus('idle');
        setShowExportModal(false);
      }, 2000);
    }, 1500);
  };

  const exportTransactions = () => {
    setShowExportModal(true);
    setExportStatus('idle');
  };

  return (
    <div className="space-y-8 -mt-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-teal-300 opacity-10 rounded-full translate-y-1/3"></div>
        
        <div className="relative z-10 p-7">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-3 mb-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <FaCreditCard className="text-teal-200" />
                <span className="text-xs font-medium text-teal-50">Financial Overview</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white flex flex-wrap items-center gap-3">
                <FaMoneyBillWave className="text-teal-200" /> 
                <span>Financial Transactions</span>
              </h2>
              
              <p className="text-teal-100 mt-1.5 max-w-lg">
                Track, manage and analyze all your financial activities in one place
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={exportTransactions}
                className="px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg transition-all flex items-center gap-2 border border-white/20"
              >
                <FaFileExport className="text-teal-200" /> Export Data
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-white text-teal-700 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <FaPlus /> Add Transaction
              </motion.button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaArrowUp className="text-green-300" size={12} />
              <span className="text-xs text-teal-50">Income: ₹{depositTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaArrowDown className="text-red-300" size={12} />
              <span className="text-xs text-teal-50">Expenses: ₹{Math.abs(withdrawalTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-100 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Net Balance</h3>
              <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <FaRupeeSign className="text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-baseline">
              <p className={`text-3xl font-bold ${totalAmount >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                ₹{totalAmount.toFixed(2)}
              </p>
              <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {transactions.length} transactions
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Current Period</span>
              <span className="text-indigo-600 font-medium">December 2023</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Total Income</h3>
              <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <FaArrowUp className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-green-600">₹{depositTotal.toFixed(2)}</p>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {transactions.filter(txn => txn.amount > 0).length} deposits
              </span>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(depositTotal / (depositTotal - withdrawalTotal)) * 100}%` }}></div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {Math.round((depositTotal / (depositTotal - withdrawalTotal)) * 100)}% of total flow
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-red-50 via-rose-50 to-red-100 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Total Expenses</h3>
              <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <FaArrowDown className="text-red-600" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-red-600">₹{Math.abs(withdrawalTotal).toFixed(2)}</p>
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                {transactions.filter(txn => txn.amount < 0).length} withdrawals
              </span>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(Math.abs(withdrawalTotal) / (depositTotal - withdrawalTotal)) * 100}%` }}></div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {Math.round((Math.abs(withdrawalTotal) / (depositTotal - withdrawalTotal)) * 100)}% of total flow
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search transactions by description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-200 focus:ring-opacity-50 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaFilter className="text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaTags className="text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="subscription">Subscription</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaRegCalendarAlt className="text-gray-500" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FaReceipt className="text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Transaction History</h3>
                <p className="text-sm text-gray-500">Complete record of your financial activities</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {sortedTransactions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-50"></div>
                <div className="relative bg-teal-50 rounded-full w-full h-full flex items-center justify-center">
                  <FaReceipt className="text-teal-400 text-2xl" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                No transactions match your current search or filters. Try adjusting your criteria or add a new transaction.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => {setFilterType('all'); setFilterCategory('all'); setSearchQuery('');}} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Clear filters
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus size={12} /> Add transaction
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg bg-gray-50">Date</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Description</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Category</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Amount</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTransactions.map((txn, index) => (
                      <motion.tr 
                        key={txn.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: index * 0.05 }
                        }}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        onClick={() => setSelectedTransaction(txn)}
                        className="cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2.5 rounded-xl mr-3 ${
                              txn.amount > 0 ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                              {txn.amount > 0 ? 
                                <FaArrowUp className="text-green-600 w-4 h-4" /> : 
                                <FaArrowDown className="text-red-600 w-4 h-4" />}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{formatDate(txn.date)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800 font-semibold">{txn.description}</div>
                          <div className="text-xs text-gray-500 mt-0.5">ID: {txn.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getCategoryIcon(txn.category)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.amount >= 0 ? '+' : ''}{txn.amount.toFixed(2)} ₹
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="p-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-full transition-colors">
                            <FaChevronRight />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-6 mt-4">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(indexOfLastItem, sortedTransactions.length)}</span> of{" "}
                        <span className="font-medium">{sortedTransactions.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-lg px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 
                                    ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => paginate(idx + 1)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                                      ${currentPage === idx + 1 
                                        ? 'z-10 bg-teal-600 text-white'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-lg px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 
                                    ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-5 ${
                selectedTransaction.amount >= 0 ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-rose-700'
              } text-white`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {selectedTransaction.amount >= 0 ? 
                      <><FaArrowUp /> Income Transaction</> : 
                      <><FaArrowDown /> Expense Transaction</>
                    }
                  </h3>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-center">
                    <div className={`px-6 py-5 ${
                      selectedTransaction.amount >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    } rounded-xl`}>
                      <div className="text-sm font-medium mb-1 text-center">Transaction Amount</div>
                      <div className="text-3xl font-bold text-center">
                        {selectedTransaction.amount >= 0 ? '+' : ''}₹{selectedTransaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="font-medium flex items-center gap-2">
                        <FaRegCalendarAlt className="text-gray-400" size={14} />
                        {formatDate(selectedTransaction.date)}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Category</div>
                      <div>{getCategoryIcon(selectedTransaction.category)}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Description</div>
                    <div className="font-medium text-gray-800">{selectedTransaction.description}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                    <div className="font-mono text-sm bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                      <span>{selectedTransaction.id}</span>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                        <FaCopy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTransaction(null)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Close
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm font-medium"
                    >
                      Edit Transaction
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-5 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaPlus /> Add New Transaction
                  </h3>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <FaRupeeSign className="text-gray-500" size={16} />
                      </div>
                      <input 
                        type="number"
                        step="0.01"
                        className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 text-lg font-medium"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span 
                        className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 cursor-pointer hover:bg-green-100"
                      >
                        Income (+)
                      </span>
                      <span 
                        className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-700 cursor-pointer hover:bg-red-100"
                      >
                        Expense (-)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input 
                      type="text"
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                      placeholder="What's this transaction for?"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                          <FaRegCalendarAlt className="text-gray-500" size={14} />
                        </div>
                        <input 
                          type="date"
                          className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        className="block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 bg-white"
                      >
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                        <option value="subscription">Subscription</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddModal(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-medium shadow-sm"
                    >
                      Add Transaction
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => exportStatus === 'idle' && setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-5 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaFileExport /> Export Transaction Data
                  </h3>
                  <button 
                    onClick={() => exportStatus === 'idle' && setShowExportModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                    disabled={exportStatus !== 'idle'}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {exportStatus === 'idle' ? (
                  <div className="space-y-5">
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FaFileDownload className="text-teal-600 text-lg mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Export Your Data</h4>
                          <p className="text-sm text-gray-600">
                            Choose your preferred format and date range to export your transaction history.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Export Format Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                      <div className="grid grid-cols-3 gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setExportFormat('csv')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            exportFormat === 'csv'
                              ? 'border-teal-500 bg-teal-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              exportFormat === 'csv' ? 'bg-teal-100' : 'bg-gray-100'
                            }`}>
                              <FaFileDownload className={exportFormat === 'csv' ? 'text-teal-600' : 'text-gray-600'} />
                            </div>
                            <span className={`text-sm font-medium ${
                              exportFormat === 'csv' ? 'text-teal-700' : 'text-gray-700'
                            }`}>
                              CSV
                            </span>
                            <span className="text-xs text-gray-500">Excel compatible</span>
                          </div>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setExportFormat('json')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            exportFormat === 'json'
                              ? 'border-teal-500 bg-teal-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              exportFormat === 'json' ? 'bg-teal-100' : 'bg-gray-100'
                            }`}>
                              <FaFileDownload className={exportFormat === 'json' ? 'text-teal-600' : 'text-gray-600'} />
                            </div>
                            <span className={`text-sm font-medium ${
                              exportFormat === 'json' ? 'text-teal-700' : 'text-gray-700'
                            }`}>
                              JSON
                            </span>
                            <span className="text-xs text-gray-500">Developer format</span>
                          </div>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setExportFormat('pdf')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            exportFormat === 'pdf'
                              ? 'border-teal-500 bg-teal-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              exportFormat === 'pdf' ? 'bg-teal-100' : 'bg-gray-100'
                            }`}>
                              <FaFileDownload className={exportFormat === 'pdf' ? 'text-teal-600' : 'text-gray-600'} />
                            </div>
                            <span className={`text-sm font-medium ${
                              exportFormat === 'pdf' ? 'text-teal-700' : 'text-gray-700'
                            }`}>
                              PDF
                            </span>
                            <span className="text-xs text-gray-500">Print ready</span>
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Date Range Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Time', desc: `${transactions.length} transactions` },
                          { value: 'current-month', label: 'Current Month', desc: 'This month only' },
                          { value: 'last-3-months', label: 'Last 3 Months', desc: 'Recent quarter' },
                          { value: 'last-6-months', label: 'Last 6 Months', desc: 'Recent half year' }
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setExportDateRange(option.value as any)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              exportDateRange === option.value
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`font-medium ${
                                  exportDateRange === option.value ? 'text-teal-700' : 'text-gray-800'
                                }`}>
                                  {option.label}
                                </div>
                                <div className="text-xs text-gray-500">{option.desc}</div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                exportDateRange === option.value
                                  ? 'border-teal-500 bg-teal-500'
                                  : 'border-gray-300'
                              }`}>
                                {exportDateRange === option.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-white rounded-full"
                                  />
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Export Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Export Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium text-gray-800 uppercase">{exportFormat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date Range:</span>
                          <span className="font-medium text-gray-800">
                            {exportDateRange === 'all' ? 'All Time' :
                             exportDateRange === 'current-month' ? 'Current Month' :
                             exportDateRange === 'last-3-months' ? 'Last 3 Months' :
                             'Last 6 Months'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Total Transactions:</span>
                          <span className="font-bold text-teal-600">{sortedTransactions.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex justify-end gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowExportModal(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportData}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-medium shadow-sm flex items-center gap-2"
                      >
                        <FaFileExport /> Export Now
                      </motion.button>
                    </div>
                  </div>
                ) : exportStatus === 'exporting' ? (
                  <div className="py-8 space-y-6">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-4"
                      >
                        <FaFileDownload className="text-3xl text-teal-600" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Preparing Your Export...</h4>
                      <p className="text-gray-600">Please wait while we generate your file.</p>
                    </div>

                    {/* Progress Animation */}
                    <div className="max-w-sm mx-auto">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Processing Steps */}
                    <div className="space-y-2 max-w-sm mx-auto">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        <span>Collecting transaction data...</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        <span>Formatting data...</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        <span>Generating {exportFormat.toUpperCase()} file...</span>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-6">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                      >
                        <FaFileDownload className="text-3xl text-green-600" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Export Successful!</h4>
                      <p className="text-gray-600">Your transaction data has been downloaded.</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-sm mx-auto">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaFileDownload className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">transactions-{new Date().toISOString().split('T')[0]}.{exportFormat}</div>
                          <div className="text-xs text-gray-600">{sortedTransactions.length} transactions exported</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
