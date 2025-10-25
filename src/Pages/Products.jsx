import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../client';
import './Products.css';
import './sidebar.css';

const Products = () => {
    let navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token')
        navigate('/')
    }

    const [Products, setProducts] = useState([])
    const [searchInput, setSearchInput] = useState("")   
    const [searchTerm, setSearchTerm] = useState("") 
    
    const [Product, setProduct]=useState({
        brand:'', name:'', category:'', size:'', qtypercase:'', stock:'', pricepercase:'', priceperitem:'' 
    })
        
    const [Product2, setProduct2]=useState({
        id:'', brand:'', name:'', category:'', size:'', qtypercase:'', stock:'', pricepercase:'', priceperitem:''
    })
    const [isModalOpen, setIsModalOpen] = useState(false); 
    
    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts(){
        const { data, error } = await supabase
            .from('Products')
            .select('*')
            .order('ID', { ascending: true })  
        if (error) console.log(error)
        else setProducts(data)
    }
    
    function handleChange(event){
        setProduct(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }
    
    function handleChange2(event){
        setProduct2(prevFormData=>({
            ...prevFormData,
            [event.target.name]:event.target.value
        }))
    }

    async function createProduct(e){
        e.preventDefault(); 
        if (!Product.brand || !Product.name || !Product.category || !Product.size || !Product.qtypercase || !Product.stock || !Product.pricepercase || !Product.priceperitem) {
            alert("Please fill in all required fields before submitting.")
            return;
        }
        else if (isNaN(Product.qtypercase)) {
            alert("Quantity per Case must be a number and cannot contain letters.")
            return;
        }
        else if (isNaN(Product.stock)) {
            alert("Quantity must be a number and cannot contain letters.")
            return;
        }
        else if (isNaN(Product.pricepercase)) {
            alert("Price per Case must be a number and cannot contain letters.")
            return;
        }
        else if (isNaN(Product.priceperitem)) {
            alert("Price per Item must be a number and cannot contain letters.")
            return;
        } 
        else {
            await supabase
            .from('Products')
            .insert({ 
                Brand: Product.brand, 
                Name: Product.name, 
                Category: Product.category, 
                Size: Product.size, 
                QtyPerCase: Product.qtypercase,
                Stock: Product.stock,
                PricePerCase: Product.pricepercase,
                PricePerItem: Product.priceperitem
            })
            fetchProducts()
        }
        setProduct({
            brand: '',
            name: '',
            category: '',
            size: '',
            qtypercase: '',
            stock: '',
            pricepercase: '',
            priceperitem: ''
        })
    }

    async function deleteProduct(productId){
        const confirmDelete = window.confirm("Are you sure you want to delete this product?");
            if (!confirmDelete) return;
        const { error } = await supabase
        .from('Products')
        .delete()
        .eq('ID', productId)
        if (error) {
            console.error("Supabase error:", error);
            alert(`Error deleting product: ${error.message}`);
        } else {
            fetchProducts()
        }
    }
    
    function displayProduct(productId){
        Products.forEach((Product)=>{
            if(Product.ID === productId){
                setProduct2({
                    id: Product.ID,
                    brand: Product.Brand, 
                    name: Product.Name, 
                    category: Product.Category, 
                    size: Product.Size, 
                    qtypercase: Product.QtyPerCase,
                    stock: Product.Stock,
                    pricepercase: Product.PricePerCase,
                    priceperitem: Product.PricePerItem
                })
                setIsModalOpen(true);
            }
        })
    }

    async function updateProduct(productId){
        if (!Product2.brand || !Product2.name || !Product2.category || !Product2.size || !Product2.qtypercase || !Product2.stock || !Product2.pricepercase || !Product2.priceperitem) {
            alert("Please fill in all required fields before submitting.")
            return;
        }
        else if (isNaN(Product2.qtypercase)) {
            alert("Quantity per Case must be a number and cannot contain letters.")
            return;
        }
        else if (isNaN(Product2.stock)) {
            alert("Quantity must be a number and cannot contain letters.")
            return;
        }
        else if (isNaN(Product2.pricepercase)) {
            alert("Price per Case must be a number and cannot contain letters.")
            return;
        }
        else if (isNaN(Product2.priceperitem)) {
            alert("Price per Item must be a number and cannot contain letters.")
            return;
        }
        const {data, error} = await supabase
        .from('Products')
        .update({
            Brand: Product2.brand, 
            Name: Product2.name, 
            Category: Product2.category, 
            Size: Product2.size, 
            QtyPerCase: Product2.qtypercase,
            Stock: Product2.stock,
            PricePerCase: Product2.pricepercase,
            PricePerItem: Product2.priceperitem
         })
        .eq('ID', productId) 
              
        fetchProducts()
        if(error) console.log(error)
        if(data) console.log(data)
    
        setProduct2({
            brand: '',
            name: '',
            catgory: '',
            size: '',
            qtypercase: '',
            stock: '',
            pricepercase: '',
            priceperitem: ''
        });
    }
    
    const filteredProducts = Products.filter(e => 
        e.Brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className = "Products">
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

            <h2>Add New Product</h2>
            <form className="product-form" onSubmit={createProduct}>
                <div className="form-grid">
                    <div className="form-group">
                    <label>Product Brand</label>
                    <input 
                        type="text"
                        name="brand"
                        value={Product.brand}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Product Description</label>
                    <input 
                        type="text"
                        name="name"
                        value={Product.name}
                        onChange={handleChange}
                    />
                    </div> 

                    <div className="form-group">
                    <label>Product Category</label>
                    <input 
                        type="text"
                        name="category"
                        value={Product.category}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Product Size</label>
                    <input 
                        type="text"
                        name="size"
                        value={Product.size}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                        <label>Quantity Per Case</label>
                        <input 
                            type="text"
                            name="qtypercase"
                            value={Product.qtypercase}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                    <label>Quantity</label>
                    <input 
                        type="text"
                        name="stock"
                        value={Product.stock}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Price Per Case</label>
                    <input 
                        type="text"
                        name="pricepercase"
                        value={Product.pricepercase}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="form-group">
                    <label>Price Per Item</label>
                    <input 
                        type="text"
                        name="priceperitem"
                        value={Product.priceperitem}
                        onChange={handleChange}
                    />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit">Add Product</button>
                </div>
            </form>

            {isModalOpen && (
                <div className="product_modal-overlay">
                    <div className="product_modal">
                    <h1>EDIT PRODUCT</h1>
                    <form onSubmit={(e)=> {e.preventDefault(); updateProduct(Product2.id); setIsModalOpen(false);}}>
                        <input 
                            type="text"
                            name="brand"
                            value={Product2.brand}
                            onChange={handleChange2}
                            placeholder="Product Brand"
                        />
                        <input 
                            type="text"
                            name="name"
                            value={Product2.name}
                            onChange={handleChange2}
                            placeholder="Product Description"
                        />
                        <input 
                            type="text"
                            name="category"
                            value={Product2.category}
                            onChange={handleChange2}
                            placeholder="Product Category"
                        />
                        <input 
                            type="text"
                            name="size"
                            value={Product2.size}
                            onChange={handleChange2}
                            placeholder="Product Size"
                        />
                        <input 
                            type="text"
                            name="qtypercase"
                            value={Product2.qtypercase}
                            onChange={handleChange2}
                            placeholder="Quantity Per Case"
                        />
                        <input 
                            type="text"
                            name="stock"
                            value={Product2.stock}
                            onChange={handleChange2}
                            placeholder="Stock"
                        />
                        <input 
                            type="text"
                            name="pricepercase"
                            value={Product2.pricepercase}
                            onChange={handleChange2}
                            placeholder="Price Per Case"
                        />
                        <input 
                            type="text"
                            name="priceperitem"
                            value={Product2.priceperitem}
                            onChange={handleChange2}
                            placeholder="Price Per Item"
                        />
                        <div className="product_modal-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            <h2>Search Product</h2>
            <div className="product_searchform">
                <input 
                    type="text" 
                    placeholder="Search by Product Brand"
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

            <h2>Product List</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Size</th>
                            <th>Quantity Per Case</th>
                            <th>Stock</th>
                            <th>Price Per Case</th>
                            <th>Price Per Item</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((Product) =>
                            <tr key={Product.ID}>
                                <td>{Product.Brand}</td>
                                <td>{Product.Name}</td>
                                <td>{Product.Category}</td>
                                <td>{Product.Size}</td>
                                <td>{Product.QtyPerCase}</td>
                                <td>{Product.Stock}</td>
                                <td>P {Product.PricePerCase}</td>
                                <td>P {Product.PricePerItem}</td>
                                <td>
                                    <button className="delete_btn" onClick={() => { deleteProduct(Product.ID) }}>Delete</button>
                                    <button className="prod_edit_btn" onClick={() => { displayProduct(Product.ID) }}>Edit</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Products
