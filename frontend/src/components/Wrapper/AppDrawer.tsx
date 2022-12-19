import * as React from 'react';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import NumbersIcon from '@mui/icons-material/Numbers';

import DeleteIcon from '@mui/icons-material/Delete';

export default function AppDrawer({drawerState, toggleDrawer,activeProjectHandler, removeProjectHandler, allProjects}: any) {

  const getIconForIndex = (index: number) => {
    return index === 0 ? <LooksOneIcon/> :
      index === 1 ? <LooksTwoIcon/> :
      index === 2 ? <Looks3Icon/> :
      index === 3 ? <Looks4Icon/> :
      index === 4 ? <Looks5Icon/> :
      index === 5 ? <Looks6Icon/> :
      <NumbersIcon/>
  }

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List><ListItem><ListItemText><strong>Projects</strong></ListItemText></ListItem></List>
      <Divider />
      {allProjects.length > 0 ? 
        <List>
          {/* @ts-ignore */}
          {allProjects && allProjects.map((project, index: number) => (
            <ListItem key={project._id} disablePadding>
              <ListItemButton
                onClick={()=> activeProjectHandler(project)}
              >
                <ListItemIcon>
                  {getIconForIndex(index)}
                </ListItemIcon>
                <ListItemText primary={project.name} />
              </ListItemButton>
              <Button 
                onClick={()=> removeProjectHandler(project._id)}
                startIcon={<DeleteIcon/>}
              />
            </ListItem>
          ))}
        </List> 
        : <List><ListItem><ListItemText>None</ListItemText></ListItem></List>
      }
    </Box>
  );

  return (
    <React.Fragment>
      <Drawer
        open={drawerState}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </React.Fragment>      
  );
}