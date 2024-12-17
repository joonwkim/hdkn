'use client'
import React from 'react'

const IntroLayout = ({ children, }: { children: React.ReactNode }) => {
    return (
        <div className='mainContent'>
            {children}
        </div>
    )
}

export default IntroLayout