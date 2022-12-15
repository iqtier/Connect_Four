import React from 'react'

const Header = () => {
  return (
    <>
        <h1 className="animated fadeInRightBig">Connect 4</h1>
        <div className="circles">
            <div className="circle red-sm"></div>
            <div className="circle yellow-sm"></div>
            <div className="circle red-sm"></div>
            <div className="circle yellow-sm"></div>
            <div className="circle red-sm"></div>
            <div className="circle yellow-sm"></div>
            <div className="circle red-sm"></div>
            <div className="circle yellow-sm"></div>
        </div>
    </>
        
  )
}

export default Header