import { MouseEvent } from "react";

function ListGroup() {
  let items = ["New york", "California", "Missisipi"];
  // items = [];

  //   const getMessage = () => {
  //     return;
  //   };

  //Event handler

  const handleClick = (event: MouseEvent) => console.log(event);

  return (
    <>
      <h1>List</h1>
      <ul className="list-group">
        {items.map((items, index) => (
          <li className="list-group-item" key={items} onClick={handleClick}>
            {items}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
