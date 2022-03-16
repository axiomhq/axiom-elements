import classNames from 'classnames';
import React from 'react';

import { QueryValues } from './QueryValues';
import { Tooltip } from './Tooltip';

import styles from './ColorTableRow.less';

export interface ColorTableRowProps {
  active?: boolean;
  color?: string;
  name: string;
  values: (string | null | number)[];
}
export const ColorTableRow: React.FC<ColorTableRowProps> = (props) => {
  const { active, color, name, values } = props;

  return (
    <tr
      className={classNames(styles.colorRow, {
        [styles.active]: active,
        // Applying an inactive style here so we can disable opacity fading
        [styles.inactive]: active === false,
      })}
    >
      <td className={styles.color} style={{ backgroundColor: color }}></td>
      <td className={styles.seriesName}>
        <Tooltip placement="bottomLeft" overlay={name}>
          <div className={styles.oneLine} data-title={name}>
            {name}
          </div>
        </Tooltip>
      </td>
      <td className={styles.value}>
        <QueryValues values={values} />
      </td>
    </tr>
  );
};
