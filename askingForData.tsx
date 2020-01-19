import React from 'react';

async function askForData(url: string) {
    //alert(url);
    try {
        //alert('trying...');
        const response = await fetch(url);
        let responseJson = await response.json();
        return responseJson;
      } catch (error) {
        //alert('error :(');
        return {info: `No data available at this moment. Please restart application and try again. We apologize for the inconvenience.`};
      }
}

export {askForData};