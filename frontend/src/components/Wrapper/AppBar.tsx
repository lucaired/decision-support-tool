import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { DecisionTree } from '../Tree/NodeHandler';

interface ButtonAppBarProps {
    activeVariant?: DecisionTree;
    activeProject?: object;
    toggleDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function ButtonAppBar({activeVariant, activeProject, toggleDrawer}: ButtonAppBarProps) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          {activeProject && <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* @ts-ignore */}
          {`Project: ${activeProject.name}`}
          </Typography>}
          {activeVariant && <Typography variant="h6" component="div">
            {`Variant: ${activeVariant.name}`}
          </Typography>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}