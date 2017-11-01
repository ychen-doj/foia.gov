import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { requestActions } from 'actions';
import AgencyComponentFinder from 'components/agency_component_finder';
import AgencyComponentPreview from 'components/agency_component_preview';
import AgencyPreview from 'components/agency_preview';
import agencyComponentStore from '../stores/agency_component';


class LandingComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agency: null,
      agencyComponent: null,
      agencyComponentsForAgency: null,
    };
  }

  render() {
    const agencyChange = (agencyComponent) => {
      // Note that the agencyComponent comes from two different sources, so the
      // properties might not be consistent.

      if (agencyComponent.type === 'agency') {
        const agency = agencyComponentStore.getAgency(agencyComponent.abbreviation);
        const agencyComponentsForAgency =
          agencyComponentStore.getAgencyComponentsForAgency(agency.id);
        this.setState({
          agency,
          agencyComponent: null,
          agencyComponentsForAgency,
        });
        return;
      }

      requestActions.fetchAgencyComponent(agencyComponent.id)
        .then(requestActions.receiveAgencyComponent)
        .then(() => {
          const component = agencyComponentStore.getAgencyComponent(agencyComponent.id);
          this.setState({
            agency: null,
            agencyComponent: component,
            agencyComponentsForAgency: null,
          });
        });
    };

    const { agencies, agencyComponents } = this.props;
    return (
      <div className="usa-grid">
        <h2>
          Select an agency to start your request or to see an agency’s contact information:
        </h2>
        <AgencyComponentFinder
          agencies={agencies}
          agencyComponents={agencyComponents}
          onAgencyChange={agencyChange}
        />
        {
          !this.state.agencyComponent && !this.state.agency &&
          <p>Remember that some agencies have existing FOIA portals and will
          continue to receive requests through their current portals. All
          agencies are working towards becoming interoperable with FOIA.gov.
          The information for where to submit a request to those agencies
          will be available after you select an agency above.</p>
        }
        {
          this.state.agencyComponent &&
          <AgencyComponentPreview agencyComponent={this.state.agencyComponent.toJS()} />
        }
        {
          this.state.agency &&
          <AgencyPreview
            agency={this.state.agency}
            agencyComponentsForAgency={this.state.agencyComponentsForAgency}
            onAgencySelect={agencyChange}
          />
        }
      </div>
    );
  }
}

LandingComponent.propTypes = {
  agencyComponents: PropTypes.object.isRequired,
  agencies: PropTypes.object.isRequired,
};

export default LandingComponent;
