import * as React from 'react';
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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';

const drawerWidth = 240;

export default function Navbar(props) {
    const {content} = props
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    const logoutUser = () =>{
      AxiosInstance.post(`logoutall/`,{
      })
      .then( () => {
         localStorage.removeItem("Token")
         navigate('/')
      }
 
      )
   }

    return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Audit
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          
            <ListItem key="home" disablePadding>
              <ListItemButton component={Link} to="/home" selected ={"/home" == path}>
                <ListItemIcon>
                  <HomeIcon /> 
                </ListItemIcon>
                <ListItemText primary={"Home"} />
              </ListItemButton>
            </ListItem>
        
            <ListItem key="search" disablePadding>
              <ListItemButton component={Link} to="/search" selected ={"/search" == path}>   
                <ListItemIcon>
                  <InfoIcon /> 
                </ListItemIcon>
                <ListItemText primary={"Search"} />
              </ListItemButton>
            </ListItem>

            <ListItem key="library" disablePadding>
              <ListItemButton component={Link} to="/yourlibrary" selected ={"/yourlibrary" == path}>   
                <ListItemIcon>
                  <InfoIcon /> 
                </ListItemIcon>
                <ListItemText primary={"YourLibrary"} />
              </ListItemButton>
            </ListItem>
            
            <ListItem key="account" disablePadding>
              <ListItemButton component={Link} to="/account" selected ={"/account" == path}>   
                <ListItemIcon>
                  <InfoIcon /> 
                </ListItemIcon>
                <ListItemText primary={"Account"} />
              </ListItemButton>
            </ListItem>

            <ListItem key={3} disablePadding>
              <ListItemButton onClick={logoutUser}>
                  <ListItemIcon>
                        <LogoutIcon/> 
                  </ListItemIcon>
                  <ListItemText primary={"Logout"} />
                </ListItemButton>
              </ListItem>
        </List>
    
       
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
            {content}
      </Box>
    </Box>
  );
}

