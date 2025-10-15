import React, { useEffect, useState } from 'react';
import { SignUp, Login, Homepage, Products, Customers, Employees, Suppliers, PurchaseOrders, SalesOrder } from './Pages';
import {Routes, Route} from 'react-router-dom';

const App = () => {

  const [token, setToken] = useState(false)

  if(token){
    sessionStorage.setItem('token',JSON.stringify(token))
  }

  useEffect(() => {
    if(sessionStorage.getItem('token')){
      let data = JSON.parse(sessionStorage.getItem('token'))
      setToken(data)
    }
  }, [])

  return (
    <div>
        <Routes>
          <Route path={'/SignUp'} element={<SignUp/>}/>
          <Route path={'/'} element={<Login setToken={setToken}/>}/>
          <Route 
            path="/Homepage" 
            element={token ? <Homepage /> : <Login setToken={setToken} />} 
          />
          <Route path="/Products" element={<Products />} />
          <Route path="/Customers" element={<Customers />} />
          <Route path="/Employees" element={<Employees />} />
          <Route path="/Suppliers" element={<Suppliers />} />
          <Route path="/PurchaseOrders" element={<PurchaseOrders />} />
          <Route path="/SalesOrder" element={<SalesOrder />} />
        </Routes>
    </div>
  )
}

export default App