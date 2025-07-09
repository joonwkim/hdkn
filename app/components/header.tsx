'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { useSession, signIn, signOut, } from "next-auth/react";
import Image from "next/image";
import GoogleLogin from '../(pages)/icons/GoogleLogin';
import { saveUserPreferenceAction } from '../actions/userPreference';

interface ThemeProps {
    theme: 'light' | 'dark' | 'auto';
    onThemeChange: (theme: 'light' | 'dark') => void;
    onWidowSidbarBtnClick: () => void;
    sidebarOpen: boolean;
}

const Header = ({ theme, onThemeChange, onWidowSidbarBtnClick, sidebarOpen }: ThemeProps) => {
    const { data: session, update } = useSession();
    const [showPopover, setShowPopover] = useState(false);
    const [viewType, setViewType] = useState<string>('')
    const [blogsPerPage, setBlogPerPage] = useState(50);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleWindowClick(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowPopover(false);
            }
        }
        window.addEventListener('click', handleWindowClick);

        return () => {
            window.removeEventListener('click', handleWindowClick);
        };
    }, []);

    useEffect(() => {
        setViewType(session?.user.preference.viewType)
        setBlogPerPage(session?.user.preference.blogsPerPage)
    }, [session?.user.preference])

    const googleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    // const saveViewMode = async (viewType: string) => {
    //     await saveUserPreferenceAction({ userId: session?.user.id, viewType, blogsPerPage: blogsPerPage })
    //     setViewType(viewType);
    //     update();
    // }

    // const saveBlogPerPage = async (blogsPerPage: number) => {
    //     await saveUserPreferenceAction({ userId: session?.user.id, viewType: viewType, blogsPerPage })
    //     setBlogPerPage(blogsPerPage);
    //     update();
    // }

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
                    {session ? (
                        <div>
                            {session?.user?.image ? (
                                <div className="position-relative">
                                    <button className="btn p-0 border-0 bg-transparent" type="button" data-bs-toggle="popover" data-bs-placement="bottom" data-bs-html="true" title="Preferences" data-bs-content="" id="userPreferencesTrigger1" onClick={(e) => { e.stopPropagation(); setShowPopover((prev) => !prev) }}>
                                        <Image className='ms-3' id="userpicture" unoptimized src={session.user?.image} alt='' title='사용자 정보를 변경을 위하여 준비되었습니다.' width="30" height="30" style={{ borderRadius: '50%', maxWidth: "100%", height: "auto" }} />
                                    </button>
                                    {showPopover && (
                                        <div className="popover bs-popover-bottom show position-absolute mt-1 fit-width"
                                            ref={popoverRef}
                                            id="userPreferencesPopover">
                                            <div className="popover-header bg-secondary text-white text-center px-3 py-2">
                                                <div>{session?.user.email.split("@")[0]}</div>
                                                <div>@{session?.user.email.split("@")[1]}</div>
                                            </div>
                                            <div className="popover-body">
                                                <div>사용자 정보 수정을 위한 화면을 준비중입니다.</div>
                                                {/* <div className="mb-2">
                                                    <div>보기형태:</div>
                                                    <div className="ms-2 d-flex gap-2">
                                                        <button className={`btn btn-sm ${viewType === "summary" ? "btn-secondary" : "btn-outline-secondary"}`} title="요약형태보기" onClick={() => saveViewMode("summary")}>
                                                            <i className="bi bi-view-stacked"></i>
                                                        </button>
                                                        <button className={`btn btn-sm ${viewType === "card" ? "btn-secondary" : "btn-outline-secondary"}`} title="카드형태보기" onClick={() => saveViewMode("card")}>
                                                            <i className="bi bi-grid"></i>
                                                        </button>
                                                        <button className={`btn btn-sm ${viewType === "table" ? "btn-secondary" : "btn-outline-secondary"}`} title="테이블형태보기" onClick={() => saveViewMode("table")}>
                                                            <i className="bi bi-table"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="my-2">
                                                    <div className="mt-2 popover-pagesize">페이지당 게시글 수:</div>
                                                    <input type="number" title="blogsetting" className="form-control form-control-sm input-xs" value={blogsPerPage} onChange={(e) => saveBlogPerPage(Number(e.target.value))} />
                                                </div> */}
                                            </div>
                                        </div>
                                    )}
                                    <button className="btn btn-outline-danger border border-0 me-3" onClick={() => signOut()} title='나가기'>
                                        <i className="bi bi-box-arrow-right"></i>
                                    </button>
                                </div>
                            ) : ''}

                        </div>
                    ) : (
                        <GoogleLogin />
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
                                {/* <Dropdown.Item onClick={() => onThemeChange('auto')} active={theme === 'auto'}>
                                    <i className="bi bi-circle-half"></i> Auto
                                </Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header