import { Button } from 'devextreme-react/button';
import { Chart, Legend, Series, ValueAxis } from 'devextreme-react/chart';
import PieChart, { Connector, Export, Format, Label, Tooltip } from 'devextreme-react/pie-chart';
import TreeMap, { Colorizer, Size, Title } from 'devextreme-react/tree-map';
import { useCallback, useEffect, useState } from 'react';
import { getStandardBarDataView, getUserProfileDetails } from '../Services/ApiServices';
import { useUser } from '../context/UserContext';
import TreeMapBreadcrumbs from './TreeMapBreadcrumbs';
import service from './dataDrilldown';
import { citiesPopulation } from './dataTreeMapDrill';


const colors = ['#6babac', '#e55253'];

function customizeTooltip(arg) {
  return {
    text: `${arg.valueText} - ${(arg.percent * 100).toFixed(2)}%`,
  };
}

function drillInfoClick(node) {
    if (node) {
      node.drillDown();
    }
  }
  function nodeClick(e) {
    e.node.drillDown();
  }

function BarChart() {
  const [standardBarList, setStandardBarList] = useState([]);
  const { user } = useUser();
  const [account, setAccount] = useState({});
  const [isFirstLevel, setIsFirstLevel] = useState(true);
  const [data, setData] = useState(service.filterData(''));

  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const accountDetails = await getUserProfileDetails(user); // Assuming this function is defined
          if (accountDetails.status === 200) {
            setAccount(accountDetails.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          console.log(account.user_id);
          const response = await getStandardBarDataView(user); // Assuming this function is defined

          if (response.status === 200) {
            setStandardBarList(response.data);
          }
          console.log(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);


  const customizePoint = useCallback(
    () => ({
      color: colors[Number(isFirstLevel)],
      hoverStyle: !isFirstLevel
        ? {
            hatching: 'none',
          }
        : {},
    }),
    [isFirstLevel]
  );
  const onPointClick = useCallback(
    (e) => {
      if (isFirstLevel) {
        setIsFirstLevel(false);
        setData(service.filterData(e.target.originalArgument.toString()));
      }
    },
    [isFirstLevel, setData, setIsFirstLevel]
  );
  const onButtonClick = useCallback(() => {
    if (!isFirstLevel) {
      setIsFirstLevel(true);
      setData(service.filterData(''));
    }
  }, [isFirstLevel, setData, setIsFirstLevel]);

  const [drillInfo, setDrillInfo] = useState([]);
  const drill = useCallback(
    (e) => {
      const newDrillInfo = [];
      for (let node = e.node.getParent(); node; node = node.getParent()) {
        newDrillInfo.unshift({
          text: node.label() || 'All Continents',
          node,
        });
      }
      if (newDrillInfo.length) {
        newDrillInfo.push({
          text: e.node.label(),
        });
      }
      setDrillInfo(newDrillInfo);
    },
    [setDrillInfo],
  );
  const dataStandard = standardBarList;
  return (
   
    <div>
      <div>
        <Chart id="chart" title="Standard Bar" dataSource={dataStandard}>
          <Series valueField="line_count" argumentField="header_id" name="My oranges" type="bar" color="#ffaa66" />
        </Chart>
      </div>
      <div>
        <Chart
          id="chart"
          title="Drill-Down Chart"
          customizePoint={customizePoint}
          onPointClick={onPointClick}
          className={isFirstLevel ? 'pointer-on-bars' : ''}
          dataSource={data}
        >
          <Series type="bar" />
          <ValueAxis showZero={false} />
          <Legend visible={false} />
        </Chart>
        <Button
          className="button-container"
          text="Back"
          icon="chevronleft"
          visible={!isFirstLevel}
          onClick={onButtonClick}
        />
      </div>
      <div>
        <PieChart id="pie" type="doughnut" title="Doughnut" palette="Soft Pastel" dataSource={dataStandard}>
          <Series argumentField="line_count">
            <Label visible format="number">
              <Connector visible />
            </Label>
          </Series>
          <Export enabled />
          <Legend margin={0} horizontalAlignment="right" verticalAlignment="top" />
          <Tooltip enabled customizeTooltip={customizeTooltip}>
            <Format type="number" />
          </Tooltip>
        </PieChart>
      </div>
      <div>
      <TreeMap
        dataSource={citiesPopulation}
        interactWithGroup
        maxDepth={2}
        onClick={nodeClick}
        onDrill={drill}
      >
        <Size height={440} />
        <Colorizer palette="Soft" />
        <Title
          text="Drill Down With Item Master "
          placeholderSize={80}
        />
      </TreeMap>
      <TreeMapBreadcrumbs
        className="drill-down-title"
        onItemClick={drillInfoClick}
        treeInfo={drillInfo}
      />
      </div>
    </div>
  );
}
export default BarChart;
