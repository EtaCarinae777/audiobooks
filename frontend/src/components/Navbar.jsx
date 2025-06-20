import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';

const drawerWidth = 240;
const miniDrawerWidth = 64;

export default function Navbar(props) {
    const { content } = props;
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const logoutUser = () => {
        AxiosInstance.post(`logoutall/`, {})
            .then(() => {
                localStorage.removeItem("Token");
                navigate('/');
            });
    };

    const toggleDrawer = () => {
        setIsCollapsed(!isCollapsed);
    };

    const menuItems = [
        {
            key: 'home',
            path: '/home',
            icon: <HomeIcon />,
            label: 'Home',
            tooltip: 'Strona główna'
        },
        {
            key: 'search',
            path: '/search',
            icon: <SearchIcon />,
            label: 'Search',
            tooltip: 'Wyszukaj'
        },
        {
            key: 'library',
            path: '/yourlibrary',
            icon: <LibraryBooksIcon />,
            label: 'Your Library',
            tooltip: 'Twoja biblioteka'
        },
        {
            key: 'account',
            path: '/account',
            icon: <AccountCircleIcon />,
            label: 'Account',
            tooltip: 'Konto'
        }
    ];

    const currentDrawerWidth = isCollapsed ? miniDrawerWidth : drawerWidth;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ 
                    width: `calc(100% - ${currentDrawerWidth}px)`, 
                    ml: `${currentDrawerWidth}px`,
                    transition: 'width 0.3s ease, margin 0.3s ease'
                }}
            >
                <Toolbar>
                    {isCollapsed && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            edge="start"
                            sx={{
                                mr: 2,
                                background: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div">
                        Audit
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                sx={{
                    width: currentDrawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: currentDrawerWidth,
                        boxSizing: 'border-box',
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden'
                    },
                }}
                variant="permanent"
                anchor="left"
                className={isCollapsed ? 'collapsed-drawer' : 'expanded-drawer'}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: isCollapsed ? 'center' : 'flex-end',
                        px: isCollapsed ? 1 : 2
                    }}
                >
                    {!isCollapsed && (
                        <IconButton 
                            onClick={toggleDrawer}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    color: 'white',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                    {isCollapsed && (
                        <IconButton 
                            onClick={toggleDrawer}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    color: 'white',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
                
                <Divider />
                
                <List sx={{ mt: 1 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.key} disablePadding>
                            <Tooltip 
                                title={isCollapsed ? item.tooltip : ''} 
                                placement="right"
                                arrow
                            >
                                <ListItemButton 
                                    component={Link} 
                                    to={item.path} 
                                    selected={item.path === path}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: isCollapsed ? 'center' : 'initial',
                                        px: isCollapsed ? 1.5 : 2,
                                        borderRadius: isCollapsed ? '12px' : '12px',
                                        mx: isCollapsed ? 1 : 1.5,
                                        mb: 1,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: isCollapsed ? 'scale(1.1)' : 'translateX(6px)',
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: isCollapsed ? 0 : 3,
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!isCollapsed && (
                                        <ListItemText 
                                            primary={item.label}
                                            sx={{
                                                opacity: isCollapsed ? 0 : 1,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>

                {/* Logout button at bottom */}
                <Box sx={{ mt: 'auto', mb: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <ListItem disablePadding>
                        <Tooltip 
                            title={isCollapsed ? 'Wyloguj się' : ''} 
                            placement="right"
                            arrow
                        >
                            <ListItemButton 
                                onClick={logoutUser}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: isCollapsed ? 'center' : 'initial',
                                    px: isCollapsed ? 1.5 : 2,
                                    borderRadius: '12px',
                                    mx: isCollapsed ? 1 : 1.5,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: isCollapsed ? 'scale(1.1)' : 'translateX(6px)',
                                        background: 'rgba(244, 67, 54, 0.2)'
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: isCollapsed ? 0 : 3,
                                        justifyContent: 'center',
                                        color: '#f44336',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <LogoutIcon />
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <ListItemText 
                                        primary="Logout"
                                        sx={{
                                            opacity: isCollapsed ? 0 : 1,
                                            transition: 'opacity 0.3s ease',
                                            '& .MuiTypography-root': {
                                                color: '#f44336'
                                            }
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{ 
                    flexGrow: 1, 
                    bgcolor: 'background.default', 
                    p: 3,
                    width: `calc(100% - ${currentDrawerWidth}px)`,
                    transition: 'width 0.3s ease'
                }}
            >
                <Toolbar />
                {content}
            </Box>
        </Box>
    );
}