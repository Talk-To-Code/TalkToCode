package ast;

import java.util.ArrayList;

/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of syntax generation of import statement in Python Programs
 */
public final class ASTImportStatementP extends ASTImportStatement{
	private ArrayList<ASTExpressionUnitLiteral> importModules;
	private ArrayList<ASTExpressionUnitIdentifier> asModules;
	private boolean hasFrom;
	public ASTImportStatementP(ASTExpressionUnitLiteral p,  boolean hasFrom) {
		super(p);
		
		this.importModules = new ArrayList<ASTExpressionUnitLiteral>();
		this.asModules = new ArrayList<ASTExpressionUnitIdentifier>();
		this.hasFrom = hasFrom;
		
		if(!this.hasFrom) {
			this.importModules.add(p);
			this.asModules.add(new ASTExpressionUnitIdentifier(""));
		}
	}
	
	public void addImport(ASTExpressionUnitLiteral str) {
		this.importModules.add(str);
		this.asModules.add(new ASTExpressionUnitIdentifier(""));
		str.addParent(this);
	}
	
	public void addAs(ASTExpressionUnitIdentifier id) {
		this.asModules.set(this.asModules.size()-1, id);
		id.addParent(this);
	}
	
	public String toSyntax(){
		this.result = "";
		if(this.hasFrom) this.result += "from " + this.packageName.toSyntax() + " ";
		this.result += "import ";
		for(int i = 0; i < this.importModules.size(); i++) {
			this.result += this.importModules.get(i).toSyntax();
			if(this.asModules.get(i).toSyntax().compareTo("") != 0) this.result += " as " + this.asModules.get(i).toSyntax();
			if(i < this.importModules.size() - 1) this.result += ", ";
		}
		this.result += "\n";
		return this.result;
	}
}
