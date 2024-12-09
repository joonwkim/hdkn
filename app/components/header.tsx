'use client'
import React from 'react'
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { useSession, signIn, signOut } from "next-auth/react";
import Image from 'next/image';

interface ThemeProps {
    theme: 'light' | 'dark' | 'auto';
    onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
}

const Header = ({ theme, onThemeChange }: ThemeProps) => {
    const { data: session } = useSession();

    const googleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    return (
        <Navbar className='sticky-top' expand="lg" bg={theme === 'dark' ? 'dark' : 'light'} variant={theme === 'dark' ? 'dark' : 'light'}>
            <Container>
                <Navbar.Brand href="#">건강한민주주의네트워크</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                    </Nav>
                    <form className="d-flex me-3" role="search">
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>

                    {session ? (<div>
                        {session?.user?.image ? (<Image className='ms-3' id="userpicture" style={{ borderRadius: '50%' }} unoptimized src={session.user?.image} alt='' title={session.user?.name ? session.user.name : ''} width="30" height="30" />) : ''}
                        <button className="btn btn-outline-danger border border-0 me-3" onClick={() => signOut()} title='나가기'>
                            <i className="bi bi-box-arrow-right"></i>
                        </button>
                    </div>

                    ) : (
                        <div className='ms-2 d-flex'>
                            <button className="btn btn-outline-light border border-0 me-3" onClick={() => googleLogin()} title='로그인'>
                                <Image
                                    src='https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg'
                                    alt="google login"
                                    width={24}
                                    height={20}
                                    style={{ cursor: 'pointer' }}
                                />
                            </button>
                        </div>

                    )}

                    <Nav className="ml-auto ms-2">
                        <Dropdown>
                            <Dropdown.Toggle variant={theme === 'dark' ? 'dark' : 'light'} id="dropdown-theme-toggle">
                                {theme === 'light' ? <i className="bi bi-sun"></i> : theme === 'dark' ? <i className="bi bi-moon-stars-fill"></i> : <i className="bi bi-circle-half"></i>}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => onThemeChange('light')} active={theme === 'light'}>
                                    <i className="bi bi-sun"></i> Light
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => onThemeChange('dark')} active={theme === 'dark'}>
                                    <i className="bi bi-moon-stars-fill"></i> Dark
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => onThemeChange('auto')} active={theme === 'auto'}>
                                    <i className="bi bi-circle-half"></i> Auto
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>


                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header