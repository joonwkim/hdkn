'use client'
import React from 'react'
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { useSession, signIn, signOut } from "next-auth/react";
import Image from 'next/image';

interface ThemeProps {
    theme: 'light' | 'dark' | 'auto';
    onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
    onWidowSidbarBtnClick: () => void;
    sidebarOpen: boolean;
}

const Header = ({ theme, onThemeChange, onWidowSidbarBtnClick, sidebarOpen }: ThemeProps) => {
    const { data: session } = useSession();

    const googleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    return (
        <Navbar className='sticky-top' expand="lg" bg={theme === 'dark' ? 'dark' : 'light'} variant={theme === 'dark' ? 'dark' : 'light'}>
            <Container>
                <Nav.Link>
                    <div className="fs-2 me-5" onClick={onWidowSidbarBtnClick} title={sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-window-sidebar" viewBox="0 0 16 16">
                            <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"></path>
                            <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1zM1 13V6h4v8H2a1 1 0 0 1-1-1m5 1V6h9v7a1 1 0 0 1-1 1z"></path>
                        </svg>
                    </div>
                </Nav.Link>

                <Navbar.Brand href="/">건강한민주주의네트워크</Navbar.Brand>

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