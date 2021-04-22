# MMM-SimpleNotifyTrashDay
Notify trash day on your MagicMirror.

## Features

## Screenshot
-`Sample screenshot 1`  
![Screenshot](https://github.com/sabo10o29/MMM-SimpleNotifyTrashDay/blob/master/sc01.png)


## UPDATE
**1.0.0**
- Simple viewer for notifying trash day.

## Installation
```javascript
cd ~/MagicMirror/modules/
git clone https://github.com/sabo10o29/MMM-SimpleNotifyTrashDay.git
cd MMM-SimpleNotifyTrashDay
npm install
```

## Necessary Configuration
```javascript
{
    module: "MMM-SimpleNotifyTrashDay",
    //Positions of *_bar and *_third are not support.
    position: "top_left",
    config: {
        trashDay:[
            {
                //Day of the week
                //'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
                DOW: ["mon", "fri"],
                //Number of week in each month
                //If you want to notify every week, please set all number.
                //1, 2, 3, 4
                NOW: [2,4],
                //
                LABEL: "Bottle",
            },
		],
    }
},
```

## Optional Configuration
| Option               | Description
|--------------------- |-----------
| `notify`     | How many days notify in advance?  <br><br>**Type:** `int` <br> **Default value:** `1`
| `timeFormat`         | The time format of the delay info based on [moment.js](https://momentjs.com/docs/). <br><br>**Type:** `String` <br> **Default value:** `MM/DD`
| `title`              | Title name <br><br>**Type:** `String` <br> **Default value:** `Trash day　　`