import React, { useCallback, useState } from "react";
import { Button, Menu, PlusIcon, Popover } from "evergreen-ui";
import "./PageBuilder.css";
import { nanoid } from "nanoid";
import { updateIn } from "immutable";

const SupportedNodes = {
  block: "Block",
  header: "Header",
} as const;
type BaseParameters = {
  name: string;
  marginTop: number;
  marginBottom: number;
  paddingTop: number;
  paddingBottom: number;
};
type NodeBase = {
  id: string;
};
type BlockContainer = {
  id: string;
  kind: typeof SupportedNodes.block;
  parameters: BaseParameters;
  childNodes: Node[];
};
type HeaderLeaf = {
  id: string;
  kind: typeof SupportedNodes.header;
  parameters: BaseParameters & {
    value: string;
  };
};
type Container = BlockContainer;
type Leaf = HeaderLeaf;
type Node = Container | Leaf;

const allowedContainerChildNodes: Record<Container["kind"], Node["kind"][]> = {
  [SupportedNodes.block]: [SupportedNodes.header] as const,
};

type NodeFactory = () => Node;
const nodeFactories: Record<Node["kind"], NodeFactory> = {
  [SupportedNodes.block]: () => ({
    id: nanoid(),
    kind: SupportedNodes.block,
    parameters: {
      marginBottom: 0,
      marginTop: 0,
      paddingTop: 0,
      paddingBottom: 0,
      name: "",
    },
    childNodes: [],
  }),
  [SupportedNodes.header]: () => ({
    id: nanoid(),
    kind: SupportedNodes.header,
    parameters: {
      marginBottom: 0,
      marginTop: 0,
      paddingTop: 0,
      paddingBottom: 0,
      name: "",
      value: "",
    },
  }),
};

const isContainer = (node: Node): node is Container => {
  return "childNodes" in node;
};

const PageBuilder = (): JSX.Element => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const addChildNode = useCallback(
    (path: number[], kind: Node["kind"]) => {
      setNodes((currentNodes) =>
        updateIn(currentNodes, path, (node: Node) => {
          if (!isContainer(node))
            throw new Error("Can't add child to this node.");
          if (!allowedContainerChildNodes[node.kind].includes(kind))
            throw new Error("Can't add child to this node.");
          const createNode = nodeFactories[kind];
          node.childNodes.push(createNode());
        }),
      );
    },
    [setNodes],
  );

  return (
    <main>
      <header>Page Builder</header>
      <div className="editor">
        <WorkSpace nodes={nodes} addChildNode={addChildNode} />
        <Panel />
      </div>
    </main>
  );
};

type AddElementMenuProps = {
  allowedChildNodes: Node["kind"][];
  addChildNode: (kind: Node["kind"]) => void;
  close: () => void;
};
const AddElementMenu = ({
  allowedChildNodes,
  addChildNode,
  close,
}: AddElementMenuProps): JSX.Element => {
  return (
    <Menu>
      {allowedChildNodes.map((name) => (
        <Menu.Item key={name}>{name}</Menu.Item>
      ))}
    </Menu>
  );
};

type AddElementButtonProps = {
  allowedChildNodes: Node["kind"][];
  addChildNode: (kind: Node["kind"]) => void;
};
const AddElementButton = ({
  allowedChildNodes,
  addChildNode,
}: AddElementButtonProps): JSX.Element => {
  return (
    <div>
      <Popover
        content={({ close }) => (
          <AddElementMenu
            allowedChildNodes={allowedChildNodes}
            addChildNode={addChildNode}
            close={close}
          />
        )}
      >
        <Button
          iconBefore={PlusIcon}
          appearance="minimal"
          className="add-element-button"
        >
          Add Element
        </Button>
      </Popover>
    </div>
  );
};
type ContainerWrapperProps = {
  allowedChildNodes: Node["kind"][];
  addChildNode: (kind: Node["kind"]) => void;
};
const ContainerWrapper: React.FC<ContainerWrapperProps> = ({
  allowedChildNodes,
  addChildNode,
  children,
}) => {
  return (
    <div>
      {children}
      <AddElementButton
        allowedChildNodes={allowedChildNodes}
        addChildNode={addChildNode}
      />
    </div>
  );
};
type WorkSpaceProps = {
  nodes: Node[];
  addChildNode: (path: number[], kind: Node["kind"]) => void;
};
const allNodeKinds = Object.values(SupportedNodes);
const WorkSpace = ({ nodes, addChildNode }: WorkSpaceProps): JSX.Element => {
  return (
    <div className="workspace">
      <ContainerWrapper
        allowedChildNodes={allNodeKinds}
        addChildNode={(kind) => {
          addChildNode([], kind);
        }}
      >
        {renderNodes(nodes, [])}
      </ContainerWrapper>
    </div>
  );
};

const Panel = (): JSX.Element => {
  return <div className="panel"></div>;
};

type NodeComponentProps = {
  node: Node;
  path: number[];
};
type NodeComponent = ({ node, path }: NodeComponentProps) => JSX.Element;

const BlockNode: NodeComponent = ({ node }) => {
  return <div>Block</div>;
};

const HeaderNode = ({ node }) => {
  return <div>Header</div>;
};

const nodeComponents: Record<Node["kind"], NodeComponent> = {
  [SupportedNodes.block]: BlockNode,
  [SupportedNodes.header]: HeaderNode,
};
const renderNode = (
  node: Node,
  parentPath: number[],
  index: number,
): JSX.Element => {
  const Component = nodeComponents[node.kind];
  const path = [...parentPath, index];

  return <Component node={node} path={path} />;
};
const renderNodes = (nodes: Node[], parentPath: number[]) =>
  nodes.map((node, index) => renderNode(node, parentPath, index));

export default PageBuilder;
