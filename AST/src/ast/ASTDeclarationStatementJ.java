package ast;

import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of ASTnode that represents
 * variable declaration statement in Java program.
 */
public final class ASTDeclarationStatementJ extends ASTDeclarationStatement {
	//1 declaration statement can declare multiple variables
	private ArrayList<ASTExpression> variables;
	//with a unique type
	private ASTExpressionUnitTypes type;
	//with modifiers like public/private/protected/static/final etc
	private ArrayList<String> modifiers;
	
	public ASTDeclarationStatementJ() {
		super();
	}
	public ASTDeclarationStatementJ(String type){
		super();
		this.type = new ASTExpressionUnitTypes(type);
		this.variables = new ArrayList<ASTExpression>();
		this.modifiers = new ArrayList<String>();
		this.type.addParent(this);
		
	}
	public void addModifier(String modifier){
		this.modifiers.add(modifier);
	}
	public void addVariable(ASTExpression exp){
		this.variables.add(exp);
		exp.addParent(this);
	}
	//code construction
	public String toSyntax(){
		this.result = "";
		for(String s:this.modifiers){
			this.result+=s;
			this.result+=" ";
		}
		this.result+=this.type.toSyntax();
		this.result+=" ";
		for(int i = 0;i<this.variables.size();i++){
			this.result+=this.variables.get(i).toSyntax();
			if(i!=this.variables.size()-1){
				this.result +=", ";
			}
		}
		this.result +=";\n";

		
		return this.result;
	}
}