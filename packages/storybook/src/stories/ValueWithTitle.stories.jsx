import { ValueWithTitle } from "@hypernetlabs/web-ui";

export default {
  title: "Layout/GovernanceValueWithTitle",
  component: ValueWithTitle,
};

const Template = (args) => (
  <div
    style={{
      height: "100vh",
      width: 600,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
    }}
  >
    <ValueWithTitle {...args} />
    <ValueWithTitle {...args} showCopy />
    <ValueWithTitle
      {...args}
      showCopy
      onEditClick={() => {
        console.log("Edit clicked!");
      }}
    />
    <ValueWithTitle
      {...args}
      showCopy
      titleRightContent={
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            borderWidth: 4,
            backgroundColor: "gray",
          }}
        />
      }
    />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  title: "Title",
  value: "This is the value.",
  showCopy: false,
};
