import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

export const TableSkeletonLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array(columns).fill().map((_, i) => (
              <th key={i}>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={12} />
                </Placeholder>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows).fill().map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array(columns).fill().map((_, colIndex) => (
                <td key={colIndex}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeletonLoader = ({ count = 1 }) => {
  return (
    <>
      {Array(count).fill().map((_, i) => (
        <Card key={i} className="mb-3">
          <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
              <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>
            <Placeholder.Button variant="primary" xs={6} />
          </Card.Body>
        </Card>
      ))}
    </>
  );
};