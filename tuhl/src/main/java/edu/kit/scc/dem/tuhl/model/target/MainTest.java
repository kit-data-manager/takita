package edu.kit.scc.dem.tuhl.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;

import edu.kit.scc.dem.tuhl.model.target.Target;

public class MainTest {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String svgCode = "//w[@xml:id=\"w.9\"]§//w[@xml:id=\"w.10\"]§//w[@xml:id=\"w.11\"]";
		String[] xPaths = svgCode.split("§");
		for (String xPath : xPaths) {
			System.out.println(xPath);
		}
		Target target = new Target("page.do/23");
		//target.setSelector("//w[@xml:id=\"w.78\"]");
		try {
			System.out.print(target.getWADMSerialization());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
