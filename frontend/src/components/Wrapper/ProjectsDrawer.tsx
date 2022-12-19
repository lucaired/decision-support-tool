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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewProjectModal } from './NewProjectModal';

export default function ProjectsDrawer({drawerState, toggleLeftDrawer,activeProjectHandler, removeProjectHandler, allProjects, saveProjectHandler}: any) {

  const [showProjectCreateModal, setShowProjectCreateModal] = React.useState(false);
  const showProjectCreateModalHandler = (state: boolean) => {
    setShowProjectCreateModal(state)
  }

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
      onClick={toggleLeftDrawer(false)}
      onKeyDown={toggleLeftDrawer(false)}
    >
      <List><ListItem><ListItemText><strong>Projects</strong></ListItemText></ListItem></List>
      <Divider />
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
      <List>
        <ListItem key={'add-project-button'} disablePadding>
          <ListItemButton
            onClick={()=> setShowProjectCreateModal(true)}
          >
            <ListItemIcon>
              <AddIcon/>
            </ListItemIcon>
            <ListItemText primary={'Add projects'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <React.Fragment>
      <Drawer
        open={drawerState}
        onClose={toggleLeftDrawer(false)}
      >
        {list()}
      </Drawer>
      <NewProjectModal 
        showModal={showProjectCreateModal}
        showProjectCreateModalHandler={showProjectCreateModalHandler}
        saveProjectHandler={saveProjectHandler}
      />
    </React.Fragment>      
  );
}