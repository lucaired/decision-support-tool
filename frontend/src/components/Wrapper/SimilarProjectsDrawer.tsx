import * as React from 'react';
import Box from '@mui/material/Box';
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

export default function SimilarProjectsDrawer({
  drawerState,
  toggleRightDrawer,
  activeProjectHandler,
  allSimilarProjectsByDE,
  allSimilarProjectsByBuildingCode
}: any) {

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
      onClick={toggleRightDrawer(false)}
      onKeyDown={toggleRightDrawer(false)}
    >
      <List><ListItem><ListItemText><strong>DE Matching</strong></ListItemText></ListItem></List>
      <Divider />
      <List>
          {/* @ts-ignore */}
          {allSimilarProjectsByDE && allSimilarProjectsByDE.map((project, index: number) => (
            <ListItem key={project._id} disablePadding>
              <ListItemButton
                onClick={()=> activeProjectHandler(project)}
              >
                <ListItemIcon>
                  {getIconForIndex(index)}
                </ListItemIcon>
                <ListItemText primary={project.name} />
              </ListItemButton>
            </ListItem>
          ))}
      </List> 
      <List><ListItem><ListItemText><strong>Building Code Matching</strong></ListItemText></ListItem></List>
      <Divider />
      <List>
          {/* @ts-ignore */}
          {allSimilarProjectsByBuildingCode && allSimilarProjectsByBuildingCode.map((project, index: number) => (
            <ListItem key={project._id} disablePadding>
              <ListItemButton
                onClick={()=> activeProjectHandler(project)}
              >
                <ListItemIcon>
                  {getIconForIndex(index)}
                </ListItemIcon>
                <ListItemText primary={project.name} />
              </ListItemButton>
            </ListItem>
          ))}
      </List> 
    </Box>
  );

  return (
    <React.Fragment>
      <Drawer
        anchor={'right'}
        open={drawerState}
        onClose={toggleRightDrawer(false)}
      >
        {list()}
      </Drawer>
    </React.Fragment>      
  );
}