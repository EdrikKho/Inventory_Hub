import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './Employees.css';
import './sidebar.css';

const Employees = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }

    const [Employees, setEmployees] = useState([])
        const [searchInput, setSearchInput] = useState("")   
        const [searchTerm, setSearchTerm] = useState("") 

    const [Employee, setEmployee]=useState({
        fname:'', mname:'', lname:'', contact_no:'', city_town:'', barangay:'', salary:'', emptype:'' 
    })
    
    const [Employee2, setEmployee2]=useState({
        id:'', fname:'', mname:'', lname:'', contact_no:'', city_town:'', barangay:'', salary:'', emptype:''
    })
    const [isModalOpen, setIsModalOpen] = useState(false); 

    useEffect(() => {
        fetchEmployees()
    }, [])
    
    async function fetchEmployees(){
        const { data, error } = await supabase
            .from('Employees')
            .select('*')
            .order('ID', { ascending: true })  
        if (error) console.log(error)
        else setEmployees(data)
    }

    function handleChange(event){
        setEmployee(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    function handleChange2(event){
        setEmployee2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    async function createEmployee(e) {
        e.preventDefault(); 

        if (!Employee.fname || !Employee.lname || !Employee.contact_no || !Employee.city_town || !Employee.barangay || !Employee.salary || !Employee.emptype) {
            alert("Please fill in all required fields before submitting.")
            return;
        }
        else if (isNaN(Employee.salary)) {
            alert("Salary must be a number and cannot contain letters.")
            return;
        } 
        else {
            await supabase
                .from('Employees')
                .insert({
                    FName: Employee.fname,
                    MName: Employee.mname,
                    LName: Employee.lname,
                    Contact_no: Employee.contact_no,
                    City_Town: Employee.city_town,
                    Barangay: Employee.barangay,
                    Salary: Employee.salary,
                    EmpType: Employee.emptype
                });

            fetchEmployees();
        }
        setEmployee({
            fname: '',
            mname: '',
            lname: '',
            contact_no: '',
            city_town: '',
            barangay: '',
            salary: '',
            emptype: ''
        });
    }

    async function deleteEmployee(employeeId) {
        const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('Employees')
            .delete()
            .eq('ID', employeeId);
        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting employee: ${error.message}`);
        } else {
            fetchEmployees()
        }
    }

    function displayEmployee(employeeId){
        Employees.forEach((Employee)=>{
            if(Employee.ID === employeeId){
                setEmployee2({
                    id: Employee.ID,
                    fname: Employee.FName, 
                    mname: Employee.MName, 
                    lname: Employee.LName, 
                    contact_no: Employee.Contact_no, 
                    city_town: Employee.City_Town,
                    barangay: Employee.Barangay,
                    salary: Employee.Salary,
                    emptype: Employee.EmpType
                })
                setIsModalOpen(true);
            }
        })
    }

    async function updateEmployee(employeeId) {
        if (!Employee2.fname || !Employee2.lname || !Employee2.contact_no || !Employee2.city_town || !Employee2.barangay || !Employee2.salary || !Employee2.emptype) {
            alert("Please fill in all required fields before saving any changes.")
            return;
        }
        else if (isNaN(Employee2.salary)) {
            alert("Salary must be a number and cannot contain letters.")
        } 
        else {
            await supabase
                .from('Employees')
                .update({
                    FName: Employee2.fname,
                    MName: Employee2.mname,
                    LName: Employee2.lname,
                    Contact_no: Employee2.contact_no,
                    City_Town: Employee2.city_town,
                    Barangay: Employee2.barangay,
                    Salary: Employee2.salary,
                    EmpType: Employee2.emptype
                })
                .eq('ID', employeeId);

            fetchEmployees()
            if(error) console.log(error)
            if(data) console.log(data)
        }
        setEmployee2({
            fname: '',
            mname: '',
            lname: '',
            contact_no: '',
            city_town: '',
            barangay: '',
            salary: '',
            emptype: ''
        });
    }

    const filteredEmployees = Employees.filter(e => 
        e.FName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className = "Employees">
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
                    <li onClick={handleLogout}>Log Out</li>
                </div>
            </div>

            <h2>Add New Employee</h2>
            <form className="employee-form" onSubmit={createEmployee}>
                <div className="form-grid">
                    <div className="form-group">
                    <label>First Name</label>
                    <input 
                        type="text"
                        name="fname"
                        value={Employee.fname}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Middle Name</label>
                    <input 
                        type="text"
                        name="mname"
                        value={Employee.mname}
                        onChange={handleChange}
                    />
                    </div> 

                    <div className="form-group">
                    <label>Last Name</label>
                    <input 
                        type="text"
                        name="lname"
                        value={Employee.lname}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Contact Number</label>
                    <input 
                        type="text"
                        name="contact_no"
                        value={Employee.contact_no}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                        <label>Address (City/Town) </label>
                        <input className="addr"
                            type="text"
                            name="city_town"
                            value={Employee.city_town}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                    <label>Barangay</label>
                    <input 
                        type="text"
                        name="barangay"
                        value={Employee.barangay}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Salary</label>
                    <input 
                        type="text"
                        name="salary"
                        value={Employee.salary}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Employee Type</label>
                    <select 
                        name="emptype" 
                        value={Employee.emptype} 
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">-- Select Type --</option>
                        <option value="S">Staff</option>
                        <option value="M">Manager</option>
                    </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit">Add Employee</button>
                </div>
            </form>

            {isModalOpen && (
                <div className="employee_modal-overlay">
                    <div className="employee_modal">
                    <h1>EDIT EMPLOYEE</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateEmployee(Employee2.id); setIsModalOpen(false);}}>
                        <input 
                            type="text"
                            name="fname"
                            value={Employee2.fname}
                            onChange={handleChange2}
                            placeholder="First Name"
                        />
                        <input 
                            type="text"
                            name="mname"
                            value={Employee2.mname}
                            onChange={handleChange2}
                            placeholder="Middle Name"
                        />
                        <input 
                            type="text"
                            name="lname"
                            value={Employee2.lname}
                            onChange={handleChange2}
                            placeholder="Last Name"
                        />
                        <input 
                            type="text"
                            name="contact_no"
                            value={Employee2.contact_no}
                            onChange={handleChange2}
                            placeholder="Contact Number"
                        />
                        <input 
                            type="text"
                            name="city_town"
                            value={Employee2.city_town}
                            onChange={handleChange2}
                            placeholder="City/Town"
                        />
                        <input 
                            type="text"
                            name="barangay"
                            value={Employee2.barangay}
                            onChange={handleChange2}
                            placeholder="Barangay"
                        />
                        <input 
                            type="text"
                            name="salary"
                            value={Employee2.salary}
                            onChange={handleChange2}
                            placeholder="Salary"
                        />
                        <select 
                            name="emptype" 
                            value={Employee2.emptype} 
                            onChange={handleChange2}
                        >
                            <option value="">-- Select Type --</option>
                            <option value="S">Staff</option>
                            <option value="M">Manager</option>
                        </select>
                        <div className="employee_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )} 

            <h2>Search Employee</h2>
            <div className="employee_searchform">
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

            <h2>Employee List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Middle Name</th>
                            <th>Last Name</th>
                            <th>Contact Number</th>
                            <th>(City/Town)</th>
                            <th>Barangay</th>
                            <th>Salary</th>
                            <th>Employee Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((Employee) =>
                            <tr key={Employee.ID}>
                                <td>{Employee.FName}</td>
                                <td>{Employee.MName}</td>
                                <td>{Employee.LName}</td>
                                <td>{Employee.Contact_no}</td>
                                <td>{Employee.City_Town}</td>
                                <td>{Employee.Barangay}</td>
                                <td>P {Employee.Salary}</td>
                                <td>{Employee.EmpType}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deleteEmployee(Employee.ID) }}>Delete</button>
                                    <button className="emp_edit_btn" onClick={() => { displayEmployee(Employee.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Employees
