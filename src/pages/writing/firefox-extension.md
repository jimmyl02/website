---
layout: ../../layouts/PostLayout.astro
title: Building a Firefox Extension with React, Tailwind, and shadcn-ui
date: Feb 22, 2024
description: "A devlog of what it's like to develop a modern Firefox extension."
tags: [Web Development]
---

### Introduction

This post provides an overview of building a Firefox extension using React, TailwindCSS, and shadcn-ui components. Frontend development moves fast and this post covers a project which attempts to use the current latest technologies. Throughout this post, we will develop an extension called "eye-break" which allows users to configure a notification that appears on a regular interval. In order to keep the length of this post reasonable, we will skip the introductions of the technologies and assume the reader knows of them; this post will introduce how to use them. The full source code of the mentioned project is [available on Github](https://github.com/jimmyl02/eye-break) if any steps are unclear or you just want a reference.

### Setup

First, we'll create the base react app which will let us create our frontend. To do this, we'll use Vite and use the typescript template. We navigate to the directory we want to work with and create the initial app with yarn.

```
yarn create vite my-app --template react-ts
```

Next up, we'll need to install TailwindCSS using the [instructions from the documentation](https://tailwindcss.com/docs/installation). This allows us to use tailwind and it's classes within our project. For a better development experience, it's also recommended to install the VSCode plugin `tailwind css intellisense` which makes the developer experience much better.

Finally, we'll need to set up some scaffolding for shadcn-ui. The [vite instructions on the documentation](https://ui.shadcn.com/docs/installation/vite) are great for getting started and once followed we should be able to use shadcn-ui within our project. One caveat is that I chose to not use the CLI tool and instead manually copy the components (which is how it's intended to be used)!

### Starting Our Extension

Now that we have the base of our project setup, we can quickly preview our site by running `yarn run dev` then visiting the URL it suggests in the browser.

This is exactly what the popup from our extension will look like except with a much more constrained width and height.

In order for our project to be recognized as an extension, we need to include a manifest. We can do this by finding the public folder and creating a file `manifest.json`. Inside that file, we can write some configuration like such:

```json=
{
    "name": "Eye Break",
    "description": "A simple application to remind you to give your eyes a break",
    "version": "0.0.1",
    "manifest_version": 2,
    "permissions": ["notifications", "storage", "alarms"],
    "homepage_url": "https://github.com/jimmyl02/eye-break",
    "browser_action": {
      "default_popup": "index.html",
      "default_title": "Eye Break",
      "default_icon": {
        "48": "logo48.png",
        "96": "logo96.png"
      }
    },
    "icons": {
      "48": "logo48.png",
      "96": "logo96.png"
    },
    "background": {
      "scripts": ["background.js"]
    }
  }
```

Some of the fields to take note of are the following:

- permissions - which permissions our extension requires (we'll learn more about this later)
- default_popup - what file to display by default
- icons - these are 48x48 and 96x96 images which are the logo for our application. they must also be in the public folder
- background - these are the scripts which will run in the background
- to view all the details, you can [view the manifest documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

With this, we can now load our extension for testing into Firefox by visiting `about:debugging`, going to this firefox, and then load a temporary extension. Typically you would click on the index.html of our final application. However, we are missing some of the files and have not yet completed the build so this will not work just yet.

![image](https://hackmd.io/_uploads/Byqj10sw6.png)

### Creating the Frontend

We've now covered all the setup work and have a project which allows us to write React code with tailwind, compile it together, and use it as a Firefox extension. We'll now move onto using tailwind and shadcn to create our components.

To quickly cover the benefits of tailwind, it essentially lets us use pre-defined class names with specific CSS properties. For example, creating a div with flex, items centered, padding, and margin would look like the following.

```html
<div
  className="flex items-center justify-center flex-col py-4 mx-4 gap-2"
></div>
```

The syntax is a little difficult to grasp at the beginning but combined with the VSCode plugin and [the documentation](https://tailwindcss.com/doc) (i.e [docs for padding](https://tailwindcss.com/docs/padding))

With tailwind, we no longer have to worry about CSS files and creating unique names. Instead, each component has it's own classes and style properties. There are more advanced ways of using tailwind but they won't be covered in this post.

For our application, the final product we want includes a switch and inputs for text data. To accomplish this in an aesthetic way, we'll use shadcn components.

The switch component can be found [here](https://ui.shadcn.com/docs/components/switch) and we can go to manual installation, then create a file called `switch.tsx` and paste the contents in. We can then use the component in our main app by including the file and using a `<Switch>` component.

There are also some [predefined typography components](https://ui.shadcn.com/docs/components/typography) which have some good presets for fonts. In order to use these as components we need to make some slight modifications to allow them to be used as components.

One way to format the new component is by creating a new file `typography.tsx` and making the following component:

```javascript=
export const TypographyH4 = ({
  children,
}: {
  children: React.JSX.Element | string;
}) => {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  );
};
```

Combined, the overall code might look like the following:

```htmlmixed=
<div className="flex items-center justify-center flex-row gap-2">
  <Switch checked={enabled} onCheckedChange={setEnabledState} />
  <TypographyH4>Enabled</TypographyH4>
</div>
```

![image](https://hackmd.io/_uploads/B1noWCovp.png)

This gives us a good looking and reusable component really easily! You now know how to use tailwind and shadcn components and can use these ideas to extend your own application.

### Background Scripts

Now that we know how to make the frontend for our extension, let's dive into how we can implement the notification on a configurable interval.

The first thing is read through the documentation of some of the browser APIs which include storage, alerts, and notifications. These are special APIs which give the extension more access to the browser and the ability to create notifications and store persistent data.

We'll create a `background.js` file in our public folder where the code in this section will go.

First, we want to work with alarms. Alarms are an API which let's us repeatedly trigger code on a periodic basis. Assuming we have an alarm called "eye-break-notification", we can then add a listener for alarms, check the name, and perform an action. This looks like the following:

```javascript=
const alarmHandler = async (alarmInfo) => {
  const alarmName = alarmInfo.name;
  if (alarmName !== "eye-break-notification") {
    console.error("Unexpected alarm name: " + alarmName);
  }

  // create notification for notification
  const message = await getMessage();
  await createNotification("Eye Break!", message);
};

browser.alarms.onAlarm.addListener(alarmHandler);
```

How do we actually create the notification? We will need to use the notifications API which can be accessed like the following:

```javascript=
const createNotification = async (title, message) => {
  await browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("logo48.png"),
    title: title,
    message: message,
  });
};
```

The final piece of the puzzle is persistent storage which can also be used to configure the notification we send. To accomplish this we can use the storage API which has a simple get and set interface.

```javascript=
/**
 * Retrieves the value of the "enabled" key from the local storage using the browser API.
 * If the "enabled" key is not found in the storage, the function returns false.
 *
 * @return {Promise<boolean>} The value of the "enabled" key in the local storage.
 */
const getEnabled = async () => {
  const storageResp = await browser.storage.local.get("enabled");
  if (!Object.keys(storageResp).includes("enabled")) {
    return false;
  }

  return storageResp["enabled"] as boolean;
};

/**
 * Sets the value of the 'enabled' property in the local storage.
 *
 * @param {boolean} value - The value to be set for the 'enabled' property.
 * @return {Promise<void>} - A promise that resolves once the value is set.
 */
const setEnabled = async (value: boolean) => {
  await browser.storage.local.set({ enabled: value });
};
```

### Putting It All Together

With the above sections, we now have all the basic knowledge and building blocks to create a functional interval notification application. For brevity, lots of pieces of the specific implementation have been omitted but they can be found in the [open source repository with the fully functioning extension](https://github.com/jimmyl02/eye-break).

To test our final plugin, we need to build the react app and load it into the browser. This can be done by first running `yarn run build` then loading the `index.html` file in the dist folder as a temporary add-on. You should see that we now have a fully functioning plugin!

![image](https://hackmd.io/_uploads/S1QGG1nD6.png)

### Conclusion

In this short post we've covered many parts of modern web development. This includes popular frameworks such as React, Vite, TailwindCSS, and shadcn components. It also covers how we can use these tools to not only make a web application but also a fully functioning Firefox extension.

Hopefully this is a helpful guide in getting started and feel free to reach out with any questions / comments on this post!
