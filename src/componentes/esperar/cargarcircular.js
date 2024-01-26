import * as React from 'react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

function CircularProgressWithLabel(props) {
    // variant="determinate"
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress  {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color={props.color} style={{fontSize:props.size ? props.size/2 : 10}}>
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
}
  
CircularProgressWithLabel.propTypes = {
/**
 * The value of the progress indicator for the determinate variant.
 * Value between 0 and 100.
 * @default 0
 */
value: PropTypes.number.isRequired,
};

export default function CargaCircular(props) {
    const { value } =props;
    return(
        <CircularProgressWithLabel {...props} />
    )
}