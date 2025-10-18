import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './SalesOrder.css';
import './sidebar.css';

const SalesOrder = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }

    const [SalesOrders, setSalesOrders] = useState([])
    const [Employees, setEmployees] = useState([])
    const [customers, setCustomers] = useState([])
    const [Products, setProducts] = useState([])
    const [LineItems, setLineItems] = useState([])
    const [searchInputSO, setSearchInputSO] = useState("")   
    const [searchTermSO, setSearchTermSO] = useState("") 
    const [searchInputLI, setSearchInputLI] = useState("")   
    const [searchTermLI, setSearchTermLI] = useState("") 

    const [SalesOrder, setSalesOrder]=useState({
        date: '', status:'', empid:'', custno:''
    })
            
    const [SalesOrder2, setSalesOrder2]=useState({
        id:'', date: '', status:'', empid:'', custno:''
    })
    
    const [LineItem, setLineItem]=useState({
        qty: '', sodno:'', prodno:''
    })
            
    const [LineItem2, setLineItem2]=useState({
        id:'', qty: '', sodno:'', prodno:''
    })

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isModalOpen2, setIsModalOpen2] = useState(false); 

    useEffect(() => {
        fetchSalesOrders()
        fetchEmployees()
        fetchCustomers()
        fetchProducts()
        fetchLineItems()
    }, [])

    async function fetchEmployees() {
        const { data, error } = await supabase
            .from('Employees')
            .select('*')
            .order('ID', { ascending: true })
        if (error) console.log(error)
        else setEmployees(data)
    }
    
    async function fetchCustomers() {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('id', { ascending: true })
        if (error) console.log(error)
        else setCustomers(data)
    }

    async function fetchProducts() {
        const { data, error } = await supabase
            .from('Products')
            .select('*')
            .order('ID', { ascending: true })
        if (error) console.log(error)
        else setProducts(data)
    }

    async function fetchSalesOrders() {
        const { data, error } = await supabase
            .from('SalesOrders')
            .select(`
                ID,
                Date,
                Status,
                EmpID,
                CustNo,
                Employees (FName),
                customers (f_name, l_name),
                TotalAmt
            `)
            .order('ID', { ascending: true })
    
        if (error) console.log(error)
        else setSalesOrders(data)
    }

    async function fetchLineItems() {
        const { data, error } = await supabase
            .from('LineItems')
            .select(`
                ID,
                Qty,
                SOdNo,
                ProdNo,
                Products (
                    Brand,
                    Name,
                    Category,
                    Size
                ),
                Subtotal
            `)
            .order('ID', { ascending: true });
        if (error) console.log(error);
        else setLineItems(data);
    }

    function handleChange(event){
        setSalesOrder(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange2(event){
        setSalesOrder2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange3(event){
        setLineItem(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange4(event){
        setLineItem2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    async function createSalesOrder(e){
        e.preventDefault(); 
        if (!SalesOrder.date || !SalesOrder.status || !SalesOrder.empid || !SalesOrder.custno) {
            alert("Please fill in all required fields before submitting.")
        }
        else {
            await supabase
            .from('SalesOrders')
            .insert({ 
                Date: SalesOrder.date, 
                Status: SalesOrder.status, 
                EmpID: SalesOrder.empid, 
                CustNo: SalesOrder.custno
            })
            fetchSalesOrders()
        }
        setSalesOrder({
            date: '',
            status: '',
            empid: '',
            custno: ''
        })
    }

    async function createLineItem(e) {
        e.preventDefault(); 
        if (!LineItem.qty || !LineItem.sodno || !LineItem.prodno) {
            alert("Please fill in all required fields before submitting.");
            return;
        }
        else if (isNaN(LineItem.qty)) {
            alert("Quantity must be a number and cannot contain letters.");
            return;
        }
        try {
            const { error } = await supabase
                .from('LineItems')
                .insert({ 
                    Qty: LineItem.qty, 
                    SOdNo: LineItem.sodno, 
                    ProdNo: LineItem.prodno 
                });
            if (error) {
                if (error.message.includes("Insufficient stock")) {
                    alert("The quantity entered exceeds the available stock for this product.");
                } else {
                    alert("Error adding line item: " + error.message);
                }
                console.error(error);
                return;
            }
                fetchLineItems()
                fetchSalesOrders()
                fetchProducts()
            setLineItem({
                qty: '',
                sodno: '',
                prodno: ''
            });
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("An unexpected error occurred while adding the line item.");
        }
    }

    async function deleteSalesOrder(salesorderId){
        const confirmDelete = window.confirm("Are you sure you want to delete this sales order?");
            if (!confirmDelete) return;
        const { error } = await supabase
        .from('SalesOrders')
        .delete()
        .eq('ID', salesorderId)
        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting sales order: ${error.message}`);
        } else {
            fetchSalesOrders()
        }  
    }

    async function deleteLineItem(lineitemId) {
        const lineItem = LineItems.find(li => li.ID === lineitemId);
        if (!lineItem) {
            alert("Line item not found.");
            return;
        }
        const salesOrder = SalesOrders.find(so => so.ID === lineItem.SOdNo);
        if (!salesOrder) {
            alert("Associated sales order not found.");
            return;
        }
        if (salesOrder.Status === "Completed") {
            alert("Cannot delete line items from a completed sales order.");
            return;
        }
        const confirmDelete = window.confirm("Are you sure you want to delete this line item?");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('LineItems')
            .delete()
            .eq('ID', lineitemId);

        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting line item: ${error.message}`);
        } else {
            fetchLineItems();
            fetchSalesOrders();
            fetchProducts();
        }
    }

    function displaySalesOrder(salesorderId){
        SalesOrders.forEach((SalesOrder)=>{
            if(SalesOrder.ID === salesorderId){
                setSalesOrder2({
                    id: SalesOrder.ID,
                    date: SalesOrder.Date,
                    status: SalesOrder.Status,
                    empid: SalesOrder.EmpID,
                    custno: SalesOrder.CustNo
                })
                setIsModalOpen(true);
            }
        })
    }

    function displayLineItem(lineitemId) {
        const lineItem = LineItems.find(li => li.ID === lineitemId);
        const salesOrder = SalesOrders.find(so => so.ID === lineItem?.SOdNo);

        if (salesOrder?.Status === "Completed") {
            alert("Cannot edit line items from a completed sales order.");
            return;
        }

        if (lineItem) {
            setLineItem2({
                id: lineItem.ID,
                qty: lineItem.Qty,
                sodno: lineItem.SOdNo,
                prodno: lineItem.ProdNo
            });
            setIsModalOpen2(true);
        }
    }


    async function updateSalesOrder(salesorderId){
        if (!SalesOrder2.date || !SalesOrder2.status || !SalesOrder2.empid || !SalesOrder2.custno) {
            alert("Please fill in all required fields before submitting.")
        }
        const {data, error} = await supabase
        .from('SalesOrders')
        .update({
            Date: SalesOrder2.date,
            Status: SalesOrder2.status, 
            EmpID: SalesOrder2.empid,
            CustNo: SalesOrder2.custno
        })
        .eq('ID', salesorderId) 
                  
        fetchSalesOrders()
        if(error) console.log(error)
        if(data) console.log(data)
        
        setSalesOrder2({
            date: '',
            status: '',
            empid: '',
            custno: ''
        });
    }
    
    async function updateLineItem(lineitemId){
        if (!LineItem2.qty || !LineItem2.sodno || !LineItem2.prodno) {
            alert("Please fill in all required fields before submitting.");
            return;
        }
        else if (isNaN(LineItem2.qty)) {
            alert("Quantity must be a number and cannot contain letters.");
            return;
        }
        const {data, error} = await supabase
        .from('LineItems')
        .update({
            Qty: LineItem2.qty,
            SOdNo: LineItem2.sodno, 
            ProdNo: LineItem2.prodno
        })
        .eq('ID', lineitemId) 

        if (error) {
            console.error("Update error:", error);
            alert("Error updating line item: " + error.message);
            return; 
        }
                  
        fetchLineItems()
        fetchSalesOrders()
        fetchProducts()
        if(error) console.log(error)
        if(data) console.log(data)
        
        setLineItem2({
            qty: '',
            sodno: '',
            prodno: ''
        });
    }

    const filteredSalesOrders = SalesOrders.filter(e => 
        e.Date.toLowerCase().includes(searchTermSO.toLowerCase())
    );

    const filteredLineItems = LineItems.filter(e => 
        String(e.SOdNo).includes(searchTermLI)
    );

    return (
        <div className = "SalesOrder">
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

            <h2>Add New Sales Order</h2>
            <form 
                className="salesorder-form" 
                onSubmit={(e) => {
                    e.preventDefault();
                    if (e.nativeEvent.submitter.name === "createSO") {
                        createSalesOrder(e);
                    } else if (e.nativeEvent.submitter.name === "createLI") {
                        createLineItem(e);
                    }
                }}
            >
                <div className="form-grid">
                    <div className="form-group">
                    <label>Date</label>
                    <input 
                        type="date"
                        name="date"
                        value={SalesOrder.date}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Status</label>
                    <select 
                        name="status" 
                        value={SalesOrder.status} 
                        onChange={handleChange}
                    >
                        <option value="">-- Select Status --</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                    </div> 

                    <div className="form-group">
                    <label>Employee Number</label>
                    <select 
                        name="empid" 
                        value={SalesOrder.empid} 
                        onChange={handleChange}
                    >
                    <option value="">-- Select Employee --</option>
                        {Employees.map((emp) => (
                        <option key={emp.ID} value={emp.ID}>
                            {emp.ID} - {emp.FName} {emp.MName} {emp.LName}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="form-group">
                    <label>Customer Number</label>
                    <select 
                        name="custno" 
                        value={SalesOrder.custno} 
                        onChange={handleChange}
                    >
                    <option value="">-- Select Customer --</option>
                        {customers.map((cust) => (
                        <option key={cust.id} value={cust.id}>
                            {cust.id} - {cust.f_name} {cust.l_name}
                        </option>
                        ))}
                    </select>
                    </div> 
                </div>
                <div className="form-actions">
                    <button type="submit" name="createSO">Add Sales Order</button>
                </div>
                
                <h3>Add New Line Item</h3>
                <div className="form-grid">
                    <div className="form-group">
                    <label>Quantity</label>
                    <input 
                        type="text"
                        name="qty"
                        value={LineItem.qty}
                        onChange={handleChange3}
                    />
                    </div>
                    <div className="form-group">
                    <label>Sales Order Number</label>
                    <select 
                        name="sodno" 
                        value={LineItem.sodno} 
                        onChange={handleChange3}
                    >
                    <option value="">-- Select Sales Order --</option>
                        {SalesOrders.map((so) => (
                        <option key={so.ID} value={so.ID}>
                            {so.ID}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="form-group">
                    <label>Product Number</label>
                    <select 
                        name="prodno" 
                        value={LineItem.prodno} 
                        onChange={handleChange3}
                    >
                    <option value="">-- Select Product --</option>
                        {Products.map((prod) => (
                        <option key={prod.ID} value={prod.ID}>
                            {prod.ID} - {prod.Brand} {prod.Name} {prod.Category} {prod.Size} - P{prod.PricePerCase} - Stock: {prod.Stock}
                        </option>
                        ))}
                    </select>
                    </div> 
                </div>
                <div className="form-actions">
                    <button type="submit" name="createLI">Add Line Item</button>
                </div>
            </form>
            
            {isModalOpen && (
                <div className="salesorder_modal-overlay">
                    <div className="salesorder_modal">
                    <h1>EDIT SALES ORDER</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateSalesOrder(SalesOrder2.id); setIsModalOpen(false);}}>
                        <input 
                            type="date"
                            name="date"
                            value={SalesOrder2.date}
                            onChange={handleChange2}
                            placeholder="Date"
                        />
                        <select 
                            name="status" 
                            value={SalesOrder2.status} 
                            onChange={handleChange2}
                        >
                            <option value="">-- Select Status --</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select 
                            name="empid" 
                            value={SalesOrder2.empid} 
                            onChange={handleChange2}
                        >
                            <option value="">-- Select Employee --</option>
                            {Employees.map((emp) => (
                            <option key={emp.ID} value={emp.ID}>
                                {emp.ID} - {emp.FName} {emp.MName} {emp.LName}
                            </option>
                            ))}
                        </select>
                        <select 
                            name="custno" 
                            value={SalesOrder2.custno} 
                            onChange={handleChange2}
                        >
                            <option value="">-- Select Customer --</option>
                            {customers.map((cust) => (
                            <option key={cust.id} value={cust.id}>
                                {cust.id} - {cust.f_name} {cust.l_name} 
                            </option>
                            ))}
                        </select>
                        <div className="salesorder_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            <h2>Search Sales Order</h2>
            <div className="salesorder_searchform">
                <input 
                    type="date" 
                    value={searchInputSO}
                    onChange={(e) => setSearchInputSO(e.target.value)}
                />
                <button 
                    onClick={() => {
                        if (!searchInputSO) {
                            alert("Please fill in the required field.");
                            return;
                        }
                        setSearchTermSO(searchInputSO);
                    }}
                >
                    Search
                </button>
                <button onClick={() => { setSearchInputSO(""); setSearchTermSO(""); }}>Clear</button>
            </div>

            <h2>Sales Order List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Sales Order Number</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Employee First Name</th>
                            <th>Customer First Name</th>
                            <th>Customer Last Name</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSalesOrders.map((SalesOrder) =>
                            <tr key={SalesOrder.ID}>
                                <td>{SalesOrder.ID}</td>
                                <td>{SalesOrder.Date}</td>
                                <td>{SalesOrder.Status}</td>
                                <td>{SalesOrder.Employees?.FName}</td>
                                <td>{SalesOrder.customers?.f_name}</td>
                                <td>{SalesOrder.customers?.l_name}</td>
                                <td>P {SalesOrder.TotalAmt}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deleteSalesOrder(SalesOrder.ID) }}>Delete</button>
                                    <button className="so_edit_btn" onClick={() => { displaySalesOrder(SalesOrder.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen2 && (
                <div className="salesorder_modal-overlay">
                    <div className="salesorder_modal">
                    <h1>EDIT LINE ITEM</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateLineItem(LineItem2.id); setIsModalOpen2(false);}}>
                        <input 
                            type="text"
                            name="qty"
                            value={LineItem2.qty}
                            onChange={handleChange4}
                            placeholder="Quantity"
                        />
                        <select 
                            name="sodno" 
                            value={LineItem2.sodno} 
                            onChange={handleChange4}
                        >
                            <option value="">-- Select Sales Order --</option>
                            {SalesOrders.map((so) => (
                            <option key={so.ID} value={so.ID}>
                                {so.ID} 
                            </option>
                            ))}
                        </select>
                        <select 
                            name="prodno" 
                            value={LineItem2.prodno} 
                            onChange={handleChange4}
                        >
                            <option value="">-- Select Product --</option>
                            {Products.map((prod) => (
                            <option key={prod.ID} value={prod.ID}>
                                {prod.ID} - {prod.Brand} {prod.Name} {prod.Category} {prod.Size} - P{prod.PricePerCase} - Stock: {prod.Stock}
                            </option>
                            ))}
                        </select>
                        <div className="salesorder_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen2(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            <h2>Search Line Item</h2>
            <div className="salesorder_searchform">
                <select  
                    value={searchInputLI}
                    onChange={(e) => setSearchInputLI(e.target.value)}
                >
                    <option value="">-- Select Sales Order --</option>
                    {SalesOrders.map((so) => (
                        <option key={so.ID} value={so.ID}>
                            {so.ID}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={() => {
                        if (!searchInputLI) {
                            alert("Please fill in the required field.");
                            return;
                        }
                        setSearchTermLI(searchInputLI);
                    }}
                >
                    Search
                </button>
                <button onClick={() => { setSearchInputLI(""); setSearchTermLI(""); }}>Clear</button>
            </div>

            <h2>Line Item List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Quantity</th>
                            <th>Product Brand</th>
                            <th>Product Description</th>
                            <th>Product Category</th>
                            <th>Product Size</th>
                            <th>SO Number</th>
                            <th>Subtotal</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLineItems.map((LineItem) =>
                            <tr key={LineItem.ID}>
                                <td>{LineItem.Qty}</td>
                                <td>{LineItem.Products?.Brand}</td>
                                <td>{LineItem.Products?.Name}</td>
                                <td>{LineItem.Products?.Category}</td>
                                <td>{LineItem.Products?.Size}</td>
                                <td>{LineItem.SOdNo}</td>
                                <td>P {LineItem.Subtotal}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deleteLineItem(LineItem.ID) }}>Delete</button>
                                    <button className="li_edit_btn" onClick={() => { displayLineItem(LineItem.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SalesOrder
