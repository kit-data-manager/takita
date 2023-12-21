package edu.kit.scc.dem.tuhl.mainpage.dashboard.annoview;

import org.springframework.stereotype.Service;

/**
 * interface for ContentView Service. Provides method to get name/type of contentView.
 */
@Service
public interface IAnnoViewService {

  /**
   * Gets type of a content view.
   *
   * @return type of content view as String
   */
  String getType();

}
