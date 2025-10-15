import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './Suppliers.css';
import './sidebar.css';

const Suppliers = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }
    const [Suppliers, setSuppliers] = useState([])
        const [searchInput, setSearchInput] = useState("")   
        const [searchTerm, setSearchTerm] = useState("") 
    
    const [Supplier, setSupplier]=useState({
        comname: '', fname:'', lname:'', contact_no:'', city_town:'', barangay:'' 
    })
        
    const [Supplier2, setSupplier2]=useState({
        id:'', comname: '', fname:'', lname:'', contact_no:'', city_town:'', barangay:'' 
    })
    const [isModalOpen, setIsModalOpen] = useState(false); 
    
    useEffect(() => {
        fetchSuppliers()
    }, [])

    async function fetchSuppliers(){
        const { data, error } = await supabase
            .from('Suppliers')
            .select('*')
            .order('ID', { ascending: true })  
        if (error) console.log(error)
        else setSuppliers(data)
    }

    function handleChange(event){
        setSupplier(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange2(event){
        setSupplier2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    async function createSupplier(e){
        e.preventDefault(); 
        if (!Supplier.comname || !Supplier.fname || !Supplier.lname || !Supplier.contact_no || !Supplier.city_town || !Supplier.barangay) {
            alert("Please fill in all required fields before submitting.")
            return;
        }
        else {
            await supabase
            .from('Suppliers')
            .insert({ 
                ComName: Supplier.comname, 
                Contact_PFName: Supplier.fname, 
                Contact_PLName: Supplier.lname, 
                Contact_no: Supplier.contact_no, 
                City_Town: Supplier.city_town,
                Barangay: Supplier.barangay,
            })
            fetchSuppliers()
        }
        setSupplier({
            comname: '',
            fname: '',
            lname: '',
            contact_no: '',
            city_town: '',
            barangay: '',
        })
    }

    async function deleteSupplier(supplierId){
        const confirmDelete = window.confirm("Are you sure you want to delete this supplier?");
        if (!confirmDelete) return;

        const { error } = await supabase
        .from('Suppliers')
        .delete()
        .eq('ID', supplierId)
        
        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting employee: ${error.message}`);
        } else {
            fetchSuppliers()
        }
    }

    function displaySupplier(supplierId){
        Suppliers.forEach((Supplier)=>{
            if(Supplier.ID === supplierId){
                setSupplier2({
                    id: Supplier.ID,
                    comname: Supplier.ComName,
                    fname: Supplier.Contact_PFName,  
                    lname: Supplier.Contact_PLName, 
                    contact_no: Supplier.Contact_no, 
                    city_town: Supplier.City_Town,
                    barangay: Supplier.Barangay,
                })
                setIsModalOpen(true);
            }
        })
    }

    async function updateSupplier(supplierId){
         if (!Supplier2.comname || !Supplier2.fname || !Supplier2.lname || !Supplier2.contact_no || !Supplier2.city_town || !Supplier2.barangay) {
            alert("Please fill in all required fields before saving any changes.");
            return;
        }
        else {
            const {data, error} = await supabase
            .from('Suppliers')
            .update({
                ComName: Supplier2.comname, 
                Contact_PFName: Supplier2.fname, 
                Contact_PLName: Supplier2.lname, 
                Contact_no: Supplier2.contact_no, 
                City_Town: Supplier2.city_town,
                Barangay: Supplier2.barangay,
            })
            .eq('ID', supplierId) 
                
            fetchSuppliers()
            if(error) console.log(error)
            if(data) console.log(data)
        
            setSupplier2({
                comname: '',
                fname: '',
                lname: '',
                contact_no: '',
                city_town: '',
                barangay: '',
            });
        }
    }

    const filteredSuppliers = Suppliers.filter(e => 
        e.ComName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className = "Suppliers">
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
            
            <h2>Add New Supplier</h2>
            <form className="supplier-form" onSubmit={createSupplier}>
                <div className="form-grid">
                    <div className="form-group">
                    <label>Company Name</label>
                    <input 
                        type="text"
                        name="comname"
                        value={Supplier.comname}
                        onChange={handleChange}
                    />
                    </div> 

                    <div className="form-group">
                    <label>Contact Person (First Name)</label>
                    <input 
                        type="text"
                        name="fname"
                        value={Supplier.fname}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Contact Person (Last Name)</label>
                    <input 
                        type="text"
                        name="lname"
                        value={Supplier.lname}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Contact Number</label>
                    <input 
                        type="text"
                        name="contact_no"
                        value={Supplier.contact_no}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                        <label>Address (City/Town) </label>
                        <input className="addr"
                            type="text"
                            name="city_town"
                            value={Supplier.city_town}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                    <label>Barangay</label>
                    <input 
                        type="text"
                        name="barangay"
                        value={Supplier.barangay}
                        onChange={handleChange}
                    />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit">Add Supplier</button>
                </div>
            </form>
            {isModalOpen && (
                <div className="supplier_modal-overlay">
                    <div className="supplier_modal">
                    <h1>EDIT SUPPLIER</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateSupplier(Supplier2.id); setIsModalOpen(false);}}>
                        <input 
                            type="text"
                            name="comname"
                            value={Supplier2.comname}
                            onChange={handleChange2}
                            placeholder="Company Name"
                        />
                        <input 
                            type="text"
                            name="fname"
                            value={Supplier2.fname}
                            onChange={handleChange2}
                            placeholder="First Name"
                        />
                        <input 
                            type="text"
                            name="lname"
                            value={Supplier2.lname}
                            onChange={handleChange2}
                            placeholder="Last Name"
                        />
                        <input 
                            type="text"
                            name="contact_no"
                            value={Supplier2.contact_no}
                            onChange={handleChange2}
                            placeholder="Contact Number"
                        />
                        <input 
                            type="text"
                            name="city_town"
                            value={Supplier2.city_town}
                            onChange={handleChange2}
                            placeholder="City/Town"
                        />
                        <input 
                            type="text"
                            name="barangay"
                            value={Supplier2.barangay}
                            onChange={handleChange2}
                            placeholder="Barangay"
                        />
                        <div className="supplier_modal-buttons">
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )} 

            <h2>Search Supplier</h2>
            <div className="supplier_searchform">
                <input 
                    type="text" 
                    placeholder="Search by Company Name"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                    onClick={() => {
                        if (searchInput.trim() === "") {
                        alert("Please fill in the required field.");
                        return;
                        }
                        setSearchTerm(searchInput);
                    }}
                    >
                    Search
                </button>
                <button onClick={() => { setSearchInput(""); setSearchTerm(""); }}>Clear</button>
            </div>

            <h2>Supplier List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Contact Number</th>
                            <th>(City/Town)</th>
                            <th>Barangay</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map((Supplier) =>
                            <tr key={Supplier.ID}>
                                <td>{Supplier.ComName}</td>
                                <td>{Supplier.Contact_PFName}</td>
                                <td>{Supplier.Contact_PLName}</td>
                                <td>{Supplier.Contact_no}</td>
                                <td>{Supplier.City_Town}</td>
                                <td>{Supplier.Barangay}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deleteSupplier(Supplier.ID) }}>Delete</button>
                                    <button className="sup_edit_btn" onClick={() => { displaySupplier(Supplier.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Suppliers
