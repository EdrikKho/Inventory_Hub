import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './Homepage.css';
import './sidebar.css';

const Homepage = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }

    const [LowStockProducts, setLowStockProducts] = useState([]);
    const [PendingSalesOrders, setPendingSalesOrders] = useState([]);
    const [PendingPurchaseOrders, setPendingPurchaseOrders] = useState([]);
    const [DailySales, setDailySales] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [monthlyTotal, setMonthlyTotal] = useState(0);

    async function fetchLowStockProducts() {
        const { data, error } = await supabase
            .from('Products')
            .select('*')
            .lt('Stock', 5)
            .order('Stock', { ascending: true });

        if (error) console.log(error);
        else setLowStockProducts(data);
    }

    async function fetchPendingSalesOrders() {
        const { data, error } = await supabase
            .from('SalesOrders')
            .select('*')
            .eq('Status', 'Pending'); 

        if (error) console.log(error);
        else setPendingSalesOrders(data);
    }

    async function fetchPendingPurchaseOrders() {
        const { data, error } = await supabase
            .from('PurchaseOrders')
            .select('*')
            .eq('Status', 'Pending'); 

        if (error) console.log(error);
        else setPendingPurchaseOrders(data);
    }

    async function fetchDailySalesReport(month) {
        if (!month) {
            setDailySales([]);
            setMonthlyTotal(0);
            return;
        }

        const [year, monthNum] = month.split('-');
        const startDate = `${year}-${monthNum}-01`;
        const endDate = new Date(year, parseInt(monthNum), 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('SalesOrders')
            .select('Date, TotalAmt, Status')
            .eq('Status', 'Completed')
            .gte('Date', startDate)
            .lte('Date', endDate)
            .order('Date', { ascending: true });

        if (error) {
            console.log(error);
            return;
        }

        const dailyTotals = {};
        let totalSum = 0;

        data.forEach(order => {
            const date = order.Date;
            const total = parseFloat(order.TotalAmt) || 0;
            if (!dailyTotals[date]) dailyTotals[date] = 0;
            dailyTotals[date] += total;
            totalSum += total;
        });

        const formattedData = Object.entries(dailyTotals).map(([date, total]) => ({
            date,
            total
        }));

        setDailySales(formattedData);
        setMonthlyTotal(totalSum);
    }

    useEffect(() => {
        fetchLowStockProducts();
        fetchPendingSalesOrders();
        fetchPendingPurchaseOrders();

        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); 
        setSelectedMonth(currentMonth);
    }, []);

    useEffect(() => {
        fetchDailySalesReport(selectedMonth);
    }, [selectedMonth]);

    return (
        <div className="Homepage">
            <div className="sidebar">
                <ul>
                    <h1>Inventory Hub</h1>
                    <li><Link to='/Homepage'>Dashboard</Link></li>
                    <li><Link to='/Customers'>Customers</Link></li>
                    <li><Link to='/Employees'>Employees</Link></li>
                    <li><Link to='/Suppliers'>Suppliers</Link></li>
                    <li><Link to='/Products'>Products</Link></li>
                    <li><Link to='/PurchaseOrders'>Purchase Orders</Link></li>
                    <li><Link to='/SalesOrder'>Sales Orders</Link></li>
                </ul>
                <div className="logout">
                    <li onClick={handleLogout}>Logout</li>
                </div>
            </div>

            <h2>Dashboard</h2>
            <div className="dashboard-cards">
                <div className="card">
                    <h3>Pending Sales Orders</h3>
                    <p>{PendingSalesOrders.length}</p>
                </div>

                <div className="card">
                    <h3>Pending Purchase Orders</h3>
                    <p>{PendingPurchaseOrders.length}</p>
                </div>
            </div>

            <h2>Low Product Stock Report</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Size</th>
                            <th>Quantity Per Case</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {LowStockProducts.map((product) => (
                            <tr key={product.ID}>
                                <td>{product.Brand}</td>
                                <td>{product.Name}</td>
                                <td>{product.Category}</td>
                                <td>{product.Size}</td>
                                <td>{product.QtyPerCase}</td>
                                <td>{product.Stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2>Sales Report</h2>

            <form className="month-selector-form">
                <label htmlFor="month">Select Month:</label>
                <input 
                    type="month" 
                    id="month"
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)} 
                />
            </form>

            <div className="table-container">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Total Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DailySales.length > 0 ? (
                            <>
                                {DailySales.map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.date}</td>
                                        <td>P {record.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td>Total Sales for {selectedMonth}</td>
                                    <td>P {monthlyTotal.toFixed(2)}</td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan="2" className="no-data">No Sales Data Available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Homepage
