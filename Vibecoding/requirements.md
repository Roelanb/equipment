A webapp built in react/vite and typescript.

Shows a graphical representation of an enterprise's equipment.

Structure:

Regions (AMER, EMEA, APAC)
    Plants
        Areas
            Locations
                Equipment
                    - child equipment

Equipments can have attributes
Attributes can be of type string, number, boolean, date, datetime, time, enum, object, array
Attributes can be required or optional
Attributes can have a default value

Represent the enterprise with a 2d library. Use PixiJS (npm install pixi.js @pixi/react)

Add interactivity.

Use material ui for the interface.


)