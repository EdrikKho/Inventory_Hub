import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './PurchaseOrders.css';
import './sidebar.css';

const PurchaseOrder = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }

    const [PurchaseOrders, setPurchaseOrders] = useState([])
    const [Employees, setEmployees] = useState([])
    const [Suppliers, setSuppliers] = useState([])
    const [Products, setProducts] = useState([])
    const [OrderItems, setOrderItems] = useState([])
    const [searchInputPO, setSearchInputPO] = useState("")   
    const [searchTermPO, setSearchTermPO] = useState("") 
    const [searchInputOI, setSearchInputOI] = useState("")   
    const [searchTermOI, setSearchTermOI] = useState("") 
    
    const [PurchaseOrder, setPurchaseOrder]=useState({
        date: '', status:'', empid:'', supid:''
    })
        
    const [PurchaseOrder2, setPurchaseOrder2]=useState({
        id:'', date: '', status:'', empid:'', supid:''
    })

    const [OrderItem, setOrderItem]=useState({
        qty: '', podno:'', prodno:''
    })
        
    const [OrderItem2, setOrderItem2]=useState({
        id:'', qty: '', podno:'', prodno:''
    })

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isModalOpen2, setIsModalOpen2] = useState(false); 

    useEffect(() => {
        fetchPurchaseOrders()
        fetchEmployees()
        fetchSuppliers()
        fetchProducts()
        fetchOrderItems()
    }, [])

    async function fetchEmployees() {
        const { data, error } = await supabase
            .from('Employees')
            .select('*')
            .order('ID', { ascending: true })
        if (error) console.log(error)
        else setEmployees(data)
    }

    async function fetchSuppliers() {
        const { data, error } = await supabase
            .from('Suppliers')
            .select('*')
            .order('ID', { ascending: true })
        if (error) console.log(error)
        else setSuppliers(data)
    }

    async function fetchProducts() {
        const { data, error } = await supabase
            .from('Products')
            .select('*')
            .order('ID', { ascending: true })
        if (error) console.log(error)
        else setProducts(data)
    }
            
    async function fetchPurchaseOrders() {
    const { data, error } = await supabase
        .from('PurchaseOrders')
        .select(`
            ID,
            Date,
            Status,
            EmpID,
            SupID,
            Employees (FName),
            Suppliers (ComName)
        `)
        .order('ID', { ascending: true })

    if (error) console.log(error)
    else setPurchaseOrders(data)
    }

    async function fetchOrderItems() {
        const { data, error } = await supabase
            .from('OrderItems')
            .select(`
                ID,
                Qty,
                POdNo,
                ProdNo,
                Products (
                    Brand,
                    Name,
                    Category,
                    Size
                )
            `)
            .order('ID', { ascending: true });
        if (error) console.log(error);
        else setOrderItems(data);
    }


    function handleChange(event){
        setPurchaseOrder(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange2(event){
        setPurchaseOrder2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange3(event){
        setOrderItem(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange4(event){
        setOrderItem2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    async function createPurchaseOrder(e){
        e.preventDefault(); 
        if (!PurchaseOrder.date || !PurchaseOrder.status || !PurchaseOrder.empid || !PurchaseOrder.supid) {
            alert("Please fill in all required fields before submitting.")
        }
        else {
            await supabase
            .from('PurchaseOrders')
            .insert({ 
                Date: PurchaseOrder.date, 
                Status: PurchaseOrder.status, 
                EmpID: PurchaseOrder.empid, 
                SupID: PurchaseOrder.supid 
            })
            fetchPurchaseOrders()
        }
        setPurchaseOrder({
            date: '',
            status: '',
            empid: '',
            supid: ''
        })
    }

    async function createOrderItem(e){
        e.preventDefault(); 
        if (!OrderItem.qty || !OrderItem.podno || !OrderItem.prodno) {
            alert("Please fill in all required fields before submitting.")
            return;
        }
        else if (isNaN(OrderItem.qty)) {
            alert("Quantity must be a number and cannot contain letters.")
            return;
        }
        else {
            await supabase
            .from('OrderItems')
            .insert({ 
                Qty: OrderItem.qty, 
                POdNo: OrderItem.podno, 
                ProdNo: OrderItem.prodno 
            })
            fetchOrderItems()
            fetchProducts()
        }
        setOrderItem({
            qty: '',
            podno: '',
            prodno: ''
        })
    }

    async function deletePurchaseOrder(purchaseorderId){
        const confirmDelete = window.confirm("Are you sure you want to delete this purchase order?");
                if (!confirmDelete) return;
        const { error } = await supabase
        .from('PurchaseOrders')
        .delete()
        .eq('ID', purchaseorderId)
        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting purchase order: ${error.message}`);
        } else {
            fetchPurchaseOrders()
        }
    }

    async function deleteOrderItem(orderitemId) {
        const item = OrderItems.find(o => o.ID === orderitemId);
        const relatedPO = PurchaseOrders.find(p => p.ID === item?.POdNo);

        if (relatedPO?.Status === "Completed") {
            alert("You cannot delete an order item from a completed purchase order.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this order item?");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('OrderItems')
            .delete()
            .eq('ID', orderitemId);

        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting order item: ${error.message}`);
        } else {
            fetchOrderItems();
        }
    }

    
    function displayPurchaseOrder(purchaseorderId){
        PurchaseOrders.forEach((PurchaseOrder)=>{
            if(PurchaseOrder.ID === purchaseorderId){
                setPurchaseOrder2({
                    id: PurchaseOrder.ID,
                    date: PurchaseOrder.Date,
                    status: PurchaseOrder.Status,
                    empid: PurchaseOrder.EmpID,
                    supid: PurchaseOrder.SupID
                })
                setIsModalOpen(true);
            }
        })
    }

    function displayOrderItem(orderitemId) {
        const item = OrderItems.find(o => o.ID === orderitemId);
        const relatedPO = PurchaseOrders.find(p => p.ID === item?.POdNo);

        if (relatedPO?.Status === "Completed") {
            alert("You cannot edit an order item from a completed purchase order.");
            return;
        }

        setOrderItem2({
            id: item.ID,
            qty: item.Qty,
            podno: item.POdNo,
            prodno: item.ProdNo
        });
        setIsModalOpen2(true);
    }

    async function updatePurchaseOrder(purchaseorderId){
        if (!PurchaseOrder2.date || !PurchaseOrder2.status || !PurchaseOrder2.empid || !PurchaseOrder2.supid) {
            alert("Please fill in all required fields before saving any changes.")
            return;
        }
        const {data, error} = await supabase
        .from('PurchaseOrders')
        .update({
            Date: PurchaseOrder2.date,
            Status: PurchaseOrder2.status, 
            EmpID: PurchaseOrder2.empid,
            SupID: PurchaseOrder2.supid
        })
        .eq('ID', purchaseorderId) 
              
        fetchPurchaseOrders()
        if(error) console.log(error)
        if(data) console.log(data)
    
        setPurchaseOrder2({
            date: '',
            status: '',
            empid: '',
            supid: ''
        });
    }

    async function updateOrderItem(orderitemId){
        if (!OrderItem2.qty || !OrderItem2.podno || !OrderItem2.prodno) {
            alert("Please fill in all required fields before saving any changes.")
            return;
        }
        else if (isNaN(OrderItem2.qty)) {
            alert("Quantity must be a number and cannot contain letters.")
            return;
        }
        const {data, error} = await supabase
        .from('OrderItems')
        .update({
            Qty: OrderItem2.qty,
            POdNo: OrderItem2.podno, 
            ProdNo: OrderItem2.prodno
        })
        .eq('ID', orderitemId) 
              
        fetchOrderItems()
        fetchProducts()
        if(error) console.log(error)
        if(data) console.log(data)
    
        setOrderItem2({
            qty: '',
            podno: '',
            prodno: ''
        });
    }
    
    const filteredPurchaseOrders = PurchaseOrders.filter(e => 
        e.Date.toLowerCase().includes(searchTermPO.toLowerCase())
    );

    const filteredOrderItems = OrderItems.filter(e => 
        String(e.POdNo).includes(searchTermOI)
    );


    return (
        <div className = "PurchaseOrders">
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
            <h2>Add New Purchase Order</h2>
            <form 
                className="purchaseorder-form" 
                onSubmit={(e) => {
                    e.preventDefault();
                    if (e.nativeEvent.submitter.name === "createPO") {
                        createPurchaseOrder(e);
                    } else if (e.nativeEvent.submitter.name === "createOI") {
                        createOrderItem(e);
                    }
                }}
            >
                <div className="form-grid">
                    <div className="form-group">
                    <label>Date</label>
                    <input 
                        type="date"
                        name="date"
                        value={PurchaseOrder.date}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Status</label>
                    <select 
                        name="status" 
                        value={PurchaseOrder.status} 
                        onChange={handleChange}
                    >
                        <option value="">-- Select Status --</option>
                        <option value="Pending">Pending</option>
                    </select>
                    </div> 

                    <div className="form-group">
                    <label>Employee Number</label>
                    <select 
                        name="empid" 
                        value={PurchaseOrder.empid} 
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
                    <label>Supplier Number</label>
                    <select 
                        name="supid" 
                        value={PurchaseOrder.supid} 
                        onChange={handleChange}
                    >
                    <option value="">-- Select Supplier --</option>
                        {Suppliers.map((sup) => (
                        <option key={sup.ID} value={sup.ID}>
                            {sup.ID} - {sup.ComName} 
                        </option>
                        ))}
                    </select>
                    </div> 
                </div>
                <div className="form-actions">
                    <button type="submit" name="createPO">Add Purchase Order</button>
                </div>
                
                <h3>Add New Order Item</h3>
                <div className="form-grid">
                    <div className="form-group">
                    <label>Quantity</label>
                    <input 
                        type="text"
                        name="qty"
                        value={OrderItem.qty}
                        onChange={handleChange3}
                    />
                    </div>
                    <div className="form-group">
                    <label>Purchase Order Number</label>
                    <select 
                        name="podno" 
                        value={OrderItem.podno} 
                        onChange={handleChange3}
                    >
                        <option value="">-- Select Purchase Order --</option>
                        {PurchaseOrders
                            .filter(po => po.Status === "Pending")
                            .map((po) => (
                                <option key={po.ID} value={po.ID}>
                                    {po.ID} 
                                </option>
                            ))
                        }
                    </select>
                    </div>

                    <div className="form-group">
                    <label>Product Number</label>
                    <select 
                        name="prodno" 
                        value={OrderItem.prodno} 
                        onChange={handleChange3}
                    >
                    <option value="">-- Select Product --</option>
                        {Products.map((prod) => (
                        <option key={prod.ID} value={prod.ID}>
                            {prod.ID} - {prod.Brand} {prod.Name} {prod.Category} {prod.Size} - Stock: {prod.Stock}
                        </option>
                        ))}
                    </select>
                    </div> 
                </div>
                <div className="form-actions">
                    <button type="submit" name="createOI">Add Order Item</button>
                </div>

            </form>

            {isModalOpen && (
                <div className="purchaseorder_modal-overlay">
                    <div className="purchaseorder_modal">
                    <h1>EDIT PURCHASE ORDER</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updatePurchaseOrder(PurchaseOrder2.id); setIsModalOpen(false);}}>
                        <input 
                            type="date"
                            name="date"
                            value={PurchaseOrder2.date}
                            onChange={handleChange2}
                            placeholder="Date"
                        />
                        <select 
                            name="status" 
                            value={PurchaseOrder2.status} 
                            onChange={handleChange2}
                        >
                            <option value="">-- Select Status --</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select 
                            name="empid" 
                            value={PurchaseOrder2.empid} 
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
                            name="supid" 
                            value={PurchaseOrder2.supid} 
                            onChange={handleChange2}
                        >
                            <option value="">-- Select Supplier --</option>
                            {Suppliers.map((sup) => (
                            <option key={sup.ID} value={sup.ID}>
                                {sup.ID} - {sup.ComName} 
                            </option>
                            ))}
                        </select>
                        <div className="purchaseorder_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            <h2>Search Purchase Order</h2>
            <div className="purchaseorder_searchform">
                <input 
                    type="date" 
                    value={searchInputPO}
                    onChange={(e) => setSearchInputPO(e.target.value)}
                />
                <button 
                    onClick={() => {
                        if (!searchInputPO) {
                            alert("Please fill in the required field.");
                            return;
                        }
                        setSearchTermPO(searchInputPO);
                    }}
                >
                    Search
                </button>

                <button onClick={() => { setSearchInputPO(""); setSearchTermPO(""); }}>Clear</button>
            </div>
            <h2>Purchase Order List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Purchase Order Number</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Employee First Name</th>
                            <th>Company Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPurchaseOrders.map((PurchaseOrder) =>
                            <tr key={PurchaseOrder.ID}>
                                <td>{PurchaseOrder.ID}</td>
                                <td>{PurchaseOrder.Date}</td>
                                <td>{PurchaseOrder.Status}</td>
                                <td>{PurchaseOrder.Employees?.FName}</td>
                                <td>{PurchaseOrder.Suppliers?.ComName}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deletePurchaseOrder(PurchaseOrder.ID) }}>Delete</button>
                                    <button className="po_edit_btn" onClick={() => { displayPurchaseOrder(PurchaseOrder.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen2 && (
                <div className="purchaseorder_modal-overlay">
                    <div className="purchaseorder_modal">
                    <h1>EDIT ORDER ITEM</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateOrderItem(OrderItem2.id); setIsModalOpen2(false);}}>
                        <input 
                            type="text"
                            name="qty"
                            value={OrderItem2.qty}
                            onChange={handleChange4}
                            placeholder="Quantity"
                        />
                        <select 
                            name="podno" 
                            value={OrderItem2.podno} 
                            onChange={handleChange4}
                        >
                            <option value="">-- Select Purchase Order --</option>
                            {PurchaseOrders
                                .filter(po => po.Status === "Pending")
                                .map((po) => (
                                    <option key={po.ID} value={po.ID}>
                                        {po.ID} 
                                    </option>
                                ))
                            }
                        </select>
                        <select 
                            name="prodno" 
                            value={OrderItem2.prodno} 
                            onChange={handleChange4}
                        >
                            <option value="">-- Select Product --</option>
                            {Products.map((prod) => (
                            <option key={prod.ID} value={prod.ID}>
                                {prod.ID} - {prod.Brand} {prod.Name} {prod.Category} {prod.Size} - Stock: {prod.Stock}
                            </option>
                            ))}
                        </select>
                        <div className="purchaseorder_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen2(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            <h2>Search Order Item</h2>
            <div className="purchaseorder_searchform">
                <select  
                    value={searchInputOI}
                    onChange={(e) => setSearchInputOI(e.target.value)}
                >
                    <option value="">-- Select Purchase Order --</option>
                    {PurchaseOrders.map((po) => (
                        <option key={po.ID} value={po.ID}>
                            {po.ID}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={() => {
                        if (!searchInputOI) {
                            alert("Please fill in the required field.");
                            return;
                        }
                        setSearchTermOI(searchInputOI);
                    }}
                >
                    Search
                </button>
                <button onClick={() => { setSearchInputOI(""); setSearchTermOI(""); }}>Clear</button>
            </div>
            <h2>Order Item List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Quantity</th>
                            <th>Product Brand</th>
                            <th>Product Description</th>
                            <th>Product Category</th>
                            <th>Product Size</th>
                            <th>PO Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrderItems.map((OrderItem) =>
                            <tr key={OrderItem.ID}>
                                <td>{OrderItem.Qty}</td>
                                <td>{OrderItem.Products?.Brand}</td>
                                <td>{OrderItem.Products?.Name}</td>
                                <td>{OrderItem.Products?.Category}</td>
                                <td>{OrderItem.Products?.Size}</td>
                                <td>{OrderItem.POdNo}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deleteOrderItem(OrderItem.ID) }}>Delete</button>
                                    <button className="oi_edit_btn" onClick={() => { displayOrderItem(OrderItem.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PurchaseOrder
