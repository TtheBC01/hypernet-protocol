import { ListItem } from "@hypernetlabs/web-ui";

export default {
  title: "Layout/ListItem",
  component: ListItem,
};

const Template = (args) => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      padding: "40px 80px",
    }}
  >
    <ListItem
      icon={
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
      title="https://hyperpay.com"
      rightContent={<button>Details</button>}
    />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  number: "1.1",
  title: "List item title",
};
