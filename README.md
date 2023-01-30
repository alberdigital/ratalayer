# Ratalayer

Script to generate a collection of images from the layers of a PSD file.

Allows you to avoid incompatible combinations by assigning categories to layers.

You have options to generate all possible combinations or just a random subset.

## Requirements

You need to have Photoshop 24.1.1 or higher installed (probably works on older versions).

## How to run it

To run it, with the image open in Photoshop:

     File > Script > Explore...

Select the file __ratascript.jsx__

The popup window informs you of the number of images (layer combinations) that can be built.

Choose the name of the collection and the type of generation:
- Only some random images: will generate the number of images chosen at random.
- Complete traversal: will generate all possible images.

The PSD file must have a first level of groups and, within each group, a layer for each option.

Each layer must have a name with the following structure (the texts between braces are variables):

     {arbitrary text}[{probabilistic weight}]#{category 1}:{value 1}|{category 2}:{value2}|...

For example:

     witch nose[4]#nose:big|color:green

In the section "Categories" there is more information on how to use the categories.

There is a sample PSD file in the _demo-resources_ folder.

The images are generated in a _build_ folder next to the PSD file.

## Categories

Categories are a mechanism to avoid mixing layers with incompatible content. For example, to avoid this:

![Wrong image](doc-res/error1.png)

The sausages in this example are only supported on the raised arm:

![Right image](doc-res/right1.png)

To tell the script which layers are compatible with each other, we need to set a common value for all of them in a category. In this case the category can be "arm", with two values: "up" and "down". The layer with the raised arm will have the category "arm" indicated in the name with the value "up":

     raised hand#arm:up

![Raised arm](doc-res/raised-arm.png)

The layer with the sausages will have the same value for the "arm" category:

     sausage#arm:up

![Sausage](doc-res/sausage.png)

The same layer can have many categories, and the categories can be combined with a weight to control the probability in the case of generating a random subset of combinations.