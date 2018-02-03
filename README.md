IMS-backend
====

Backend services for the GT Inventory Management System.

### Using the API

The test API is available at https://ims-backend.mybluemix.net/. All requests are JSON-based.

The API is documented at https://documenter.getpostman.com/view/920629/ims-backend/7TT7pKy.

#### Data Types

##### `EquipmentAttribute`
Key | Type | Description
--- | ---- | -----------
`id` | `int` | Unique numerical identifier for this attribute.
`name` | `string` | 2-32 characters uniquely identifying this attribute.
`type` | `string` | One of `('Boolean','Currency','Integer','DateTime','String','Enum','Image','TextBox')`. Identifies the type of data that users may enter into this attribute.
`regex` | `string` | A JS-compatible regex string to validate new instances of this attribute.
`required` | `bool` | Do new instances of this attribute require a value for this attribute?
`unique` | `bool` | Should new instances of this attribute be unique across all instances of this attribute?
`public` | `bool` | Can unprivileged users see the value of this attribute?
`helpText` | `string` | Optional text presented to the user which will give hints on how to fill this attribute in.

##### `EquipmentType`
Key | Type | Description
--- | ---- | -----------
`id` | `int` | Unique numerical identifier for this equipment type.
`name` | `string` | 2-32 characters uniquely identifying this attribute.
`nameAttribute` | `int` | The `id` of an `EquipmentAttribute` that will be used as the display value for `Equipment` having this `EquipmentType`.
`available` | `bool` | Is this type available for creating new `Equipment` instances?

##### `EquipmentAttributeInstance`
Key | Type | Description
--- | ---- | -----------
`id` | `int` | Unique numerical identifier for this instance of an attribute.
`attribute` | `int` | The `id` of the `EquipmentAttribute` that this is an instance of.
`value` | `string` | The value of this instance of an attribute.

##### `Equipment`
Key | Type | Description
--- | ---- | -----------
`id`| `int` | Unique numerical identifier for this equipment.
`type` | `int` | The `EquipmentType` this equipment belongs to.
`attributes` | `EquipmentAttributeInstance[]` | All the current attributes and their values belonging to this `Equipment`.


### Contributing

To install the dependencies, run 

```
npm install -g typescript
npm install
```

Now you should be able to run ```tsc -w``` to regenerate the JS files in ```build/```. The ```.ts``` files are transpiled to JavaScript in ```build/``. 

Use ```npm start``` to start running ```build/index.js```. 

Note: the backend expects a PostgreSQL database connection URL to be present in the ```DATABASE_URL``` environment variable in order to establish a connection.