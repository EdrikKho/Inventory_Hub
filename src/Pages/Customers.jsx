import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './Customers.css';
import './sidebar.css';

const Customers = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }

    const [customers, setCustomers] = useState([])
    const [searchInput, setSearchInput] = useState("")   
    const [searchTerm, setSearchTerm] = useState("")     

    const [customer, setCustomer]=useState({
        fname:'', mname:'', lname: '', address: '', contactno:''
    })

    const [customer2, setCustomer2]=useState({
        id:'', fname:'', mname:'', lname: '', address: '', contactno:''
    })
    const [isModalOpen, setIsModalOpen] = useState(false); 


    useEffect(() => {
        fetchCustomers()
    }, [])

    async function fetchCustomers(){
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('id', { ascending: true })  
        if (error) console.log(error)
        else setCustomers(data)
    }

    function handleChange(event){
        setCustomer(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange2(event){
        setCustomer2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    async function createCustomer(e){
        e.preventDefault(); 
        if (!customer.fname || !customer.lname || !customer.address || !customer.contactno) {
            alert("Please fill in all required fields before submitting.")
            return;
        }
        else {
            await supabase
            .from('customers')
            .insert({ 
                f_name: customer.fname, 
                m_name: customer.mname, 
                l_name: customer.lname, 
                address: customer.address, 
                contact_no: customer.contactno
            })
            fetchCustomers()
        }
        setCustomer({
            fname:'', 
            mname:'', 
            lname:'', 
            address:'', 
            contactno:''
        })
    }

    async function deleteCustomer(customerId) {
        const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);
        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting customer: ${error.message}`);
        } else {
            fetchCustomers()
        }
    }

    function displayCustomer(customerId){
        customers.forEach((customer)=>{
            if(customer.id === customerId){
                setCustomer2({
                    id: customer.id, 
                    fname: customer.f_name, 
                    mname: customer.m_name, 
                    lname: customer.l_name, 
                    address: customer.address, 
                    contactno: customer.contact_no
                })
                setIsModalOpen(true);
            }
        })
    }

    async function updateCustomer(customerId) {
        if (!customer2.fname || !customer2.lname || !customer2.address || !customer2.contactno) {
            alert("Please fill in all required fields before saving any changes.")
            return;
        } 
        const { data, error } = await supabase
            .from('customers')
            .update({
                f_name: customer2.fname,
                m_name: customer2.mname,
                l_name: customer2.lname,
                address: customer2.address,
                contact_no: customer2.contactno
            })
            .eq('id', customerId);
        fetchCustomers(); 
        if(error) console.log(error)
        if(data) console.log(data)
        setCustomer2({
            id: '',
            fname: '',
            mname: '',
            lname: '',
            address: '',
            contactno: ''
        });
    }


    const filteredCustomers = customers.filter(c => 
        c.f_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="customers"> 
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
            <h2>Add New Customer</h2>
                <form className="customer-form" onSubmit={createCustomer}>
                <div className="form-grid">
                    <div className="form-group">
                    <label>First Name</label>
                    <input 
                        type="text"
                        name="fname"
                        value={customer.fname}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Middle Name</label>
                    <input 
                        type="text"
                        name="mname"
                        value={customer.mname}
                        onChange={handleChange}
                    />
                    </div> 

                    <div className="form-group">
                    <label>Last Name</label>
                    <input 
                        type="text"
                        name="lname"
                        value={customer.lname}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Contact Number</label>
                    <input 
                        type="text"
                        name="contactno"
                        value={customer.contactno}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input className="addr"
                            type="text"
                            name="address"
                            value={customer.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit">Add Customer</button>
                </div>
                </form>

                {isModalOpen && (
                <div className="customer_modal-overlay">
                    <div className="customer_modal">
                    <h1>EDIT CUSTOMER</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateCustomer(customer2.id); setIsModalOpen(false);}}>
                        <input 
                            type="text"
                            name="fname"
                            value={customer2.fname}
                            onChange={handleChange2}
                            placeholder="First Name"
                        />
                        <input 
                            type="text"
                            name="mname"
                            value={customer2.mname}
                            onChange={handleChange2}
                            placeholder="Middle Name"
                        />
                        <input 
                            type="text"
                            name="lname"
                            value={customer2.lname}
                            onChange={handleChange2}
                            placeholder="Last Name"
                        />
                        <input 
                            type="text"
                            name="address"
                            value={customer2.address}
                            onChange={handleChange2}
                            placeholder="Address"
                        />
                        <input 
                            type="text"
                            name="contactno"
                            value={customer2.contactno}
                            onChange={handleChange2}
                            placeholder="Contact Number"
                        />
                        <div className="customer_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
                )} 

                <h2>Search Customer</h2>
                <div className="customer_searchform">
                    <input 
                        type="text" 
                        placeholder="Search by First Name"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button 
                        onClick={() => {
                            if (searchInput.trim() === "") {
                                alert("Please fill in the required field.");
                            } else {
                                setSearchTerm(searchInput);
                            }
                        }}
                    >
                        Search
                    </button>
                    <button onClick={() => { setSearchInput(""); setSearchTerm(""); }}>Clear</button>
                </div>

                <h2>Customer List</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Middle Name</th>
                                <th>Last Name</th>
                                <th>Address (City)</th>
                                <th>Contact Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) =>
                                <tr key={customer.id}>
                                    <td>{customer.f_name}</td>
                                    <td>{customer.m_name}</td>
                                    <td>{customer.l_name}</td>
                                    <td>{customer.address}</td>
                                    <td>{customer.contact_no}</td>
                                    <td>
                                        <button className = "delete_btn" onClick={() => deleteCustomer(customer.id)}>Delete</button>
                                        <button className = "cust_edit-btn" onClick={()=>{displayCustomer(customer.id)}}>Edit</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
    )
}

export default Customers
