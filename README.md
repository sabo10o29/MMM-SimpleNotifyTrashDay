# MMM-SimpleNotifyTrashDay

Notify trash day on your MagicMirror.

## Features

You can set a specific day or bi-weekly garbage day for notification.

## Screenshot

-`Sample screenshot 1`  
![Screenshot](https://github.com/sabo10o29/MMM-SimpleNotifyTrashDay/blob/master/sc01.png)

## UPDATE

**1.0.0**

- Simple viewer for notifying trash day.

**1.0.1**

- Bug fix.

**1.0.2**

- Add feature: You can specify how long you want to display the notification for the day with expiredTime.

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
        notify: 7,
        trashDay:[
            {
                //e.g. Notification of every Monday and Thursday burnable trash days.
                //Day of the week
                //'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
                DOW: ["mon","thu"],
                //Number of week in each month
                //If you want to notify every week, please set all number.
                NOW: [1,2,3,4,5],
                LABEL: "可燃ゴミ",
            },
            {
                //e.g. Notification of trash days on the first and third Tuesday of every month.
                DOW: ["tue"],
                NOW: [1,3],
                LABEL: "ビン,缶,古紙",
            },
        ],
	},
},
```

## Optional Configuration

| Option        | Description                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `notify`      | How many days notify in advance? <br><br>**Type:** `int` <br> **Default value:** `1`                                                           |
| `timeFormat`  | The time format of the delay info based on [moment.js](https://momentjs.com/docs/). <br><br>**Type:** `String` <br> **Default value:** `MM/DD` |
| `title`       | Title name <br><br>**Type:** `String` <br> **Default value:** `Trash day `                                                                     |
| `expiredTime` | You can specify how long you want to display the notification for the day. <br><br>**Type:** `number` <br> **Default value:** null             |
