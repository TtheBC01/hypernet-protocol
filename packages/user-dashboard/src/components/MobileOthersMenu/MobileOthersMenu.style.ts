import { colors } from "@hypernetlabs/web-ui";
import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles({
  menuItem: {
    textTransform: "uppercase",
  },
  activeMenuItem: {
    color: colors.PURPLE700,
  },
  inactiveMenuItem: {
    opacity: 0.7,
  },
});
