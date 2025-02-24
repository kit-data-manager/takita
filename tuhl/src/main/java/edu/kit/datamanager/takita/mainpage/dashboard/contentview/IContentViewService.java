package edu.kit.datamanager.takita.mainpage.dashboard.contentview;

import org.springframework.stereotype.Service;

/**
 * interface for ContentView Service. Provides method to get name/type of contentView.
 */
@Service
public interface IContentViewService {

  /**
   * Gets type of a content view.
   *
   * @return type of content view as String
   */
  String getType();

}
