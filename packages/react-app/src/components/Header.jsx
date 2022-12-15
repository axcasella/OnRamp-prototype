import { PageHeader } from "antd";
import React from "react";
import image from "../assets/Frame.png";

export default function Header() {
  return (
    <PageHeader
      title="OnRamp"
      subTitle="Prototype"
      style={{ cursor: "pointer" }}
      avatar={{ shape: "square", src: image, size: 42 }}
    />
  );
}
