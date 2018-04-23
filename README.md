IMS-backend
====

Backend services for the GT Inventory Management System.

### Using the API

The test API is available at https://ims-backend.mybluemix.net/. All requests are JSON-based.

The API requests are fully documented at https://documenter.getpostman.com/view/3796309/ims-backend/RVg2B95p.

#### Data Types

These are the data types contained in the backend's database

##### Attribute

An Attribute represents a single type of metadata that can be attached to a Type. For example, a user might want to create a “MAC Address” Attribute to attach to the “Laptop” and “Router” Types.

Key | Type | Description
--- | ---- | -----------
`id` | `int` | Unique numerical identifier for this Attribute.
`name` | `string` | 2-32 characters uniquely identifying this Attribute.
`type` | `string` | One of `('Boolean','Currency','Integer','DateTime','String','Enum','Image','TextBox')`. Identifies the type of data that users may enter into this Attribute. Note: In data transfer, this is represented as a string for ease of parsing. However, in the database, it is stored as a Postgres enum type.
`regex` | `string` | A JS-compatible regex string to validate new instances of this Attribute. Only applies to Attributes of `String` or `TextBox` type.
`choices` | `string[]` | A list of possible values this Attribute may have. Only applies to Attributes of `Enum` type.
`uniqueGlobally` | `bool` | Should new instances of this Attribute be unique across all instances of this Attribute?
`public` | `bool` | When this field is false, unprivileged users will not be able to see the contents of this Attribute on the frontend.
`helpText` | `string` | Optional text presented to the user which will give hints on how to fill this Attribute in.
`defaultValue` | `string` | The default value this Attribute should take. For `Boolean`, this may be either `true` or `false`.
`deleted` | `bool` | If true, this Attribute has been soft-deleted and is no longer available.

##### Type

A Type represents a category of Items described by a set of Attributes attached to the Type. For example, you could have a "Laptop" type to hold all laptops, and then a "MAC Address" attribute on that type.

Key | Type | Description
--- | ---- | -----------
`id` | `int` | Unique numerical identifier for this Type.
`name` | `string` | 2-32 characters uniquely identifying this Type.
`nameAttribute` | `int` | The `id` of an Attribute that will be used as the display value for Item having this Type.
`deleted` | `bool` | If true, this Type has been soft-deleted and is no longer available.

##### Item

An Item represents 1 unique inventory item.

Key | Type | Description
--- | ---- | -----------
`id`| `int` | Unique numerical identifier for this Item.
`typeId` | `int` | The Type this Item belongs to.
`deleted` | `bool` | If this is true, the Item has been soft-deleted and will not be visible to the public.
`attributes` | `AttributeInstance[]` | All the current Attributes and their values belonging to this Item.

##### AttributeInstance

AttributeInstance relations connect singular values of Attributes to Items.

Key | Type | Description
--- | ---- | -----------
`id` | `int` | Unique numerical identifier for this instance of an attribute.
`attribute` | `int` | The `id` of the Attribute that this is an instance of.
`value` | `string` | The value of this instance of an attribute.
`itemId` | `int` | The Item that this AttributeInstance belongs to.

##### AttributeType

AttributeType relations connect Attributes to their Types.

Key | Type | Description
--- | ---- | -----------
`typeId` | `int` | The Type that is being linked.
`attributeId` | `int` | The Attribute that is being linked.
`deleted` | `bool` | Is this AttributeType still a usable relation?
`required` | `string` | One of `('Required', 'Suggested', 'Optional')`. If it is Required, attempts to pass an empty value for this Attribute will be rejected. If it is Suggested, it will be emphasized in the UI to indicate users should enter data. If it is Optional, no special treatment is done. Note: In data transfer, this is represented as a string for ease of parsing. However, in the database, it is stored as a Postgres enum type.
`uniqueForType` | `bool` | Should new instances of this AttributeType be unique across all instances of this type? Note: If the Type's `uniqueGlobally` attribute is `true`, global uniqueness will be checked regardless of this value.


### Running the backend

Requirements: NodeJS, PostgreSQL server and database
Tested with: Node v8.9.4, PostgreSQL v10.3.

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Set the ```DATABASE_URL``` environment variable to a PostgreSQL connection URL. The tables will be created automatically if they don't already exist.
4. Run `npm start` to start the server.

Now the server should be running. By default, it listens on all interfaces using port 8080. The port can be configured through the ```PORT``` environment variable.

### Developing

To install the dependencies, run 

```
npm install -g typescript
npm install
```

Now you should be able to run ```tsc -w``` to regenerate the JS files in ```build/```. The ```.ts``` files are transpiled to JavaScript in ```build/```. 

Use ```npm start``` to start running ```build/index.js```. 

Use ```npm run-script watch``` to get TypeScript to transpile your .ts files automatically when they change. You'll need to transpile your TypeScript to the JavaScript every time you make a change.

Note: the backend expects a PostgreSQL database connection URL to be present in the ```DATABASE_URL``` environment variable in order to establish a connection.